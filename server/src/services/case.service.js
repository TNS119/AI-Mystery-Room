const { nanoid } = require('nanoid');
const Case = require('../models/Case');
const AppError = require('../utils/AppError');
const { calculateScorePreview, calculateFinalScore } = require('./scoring.service');
const { generateMysteryWithAI } = require('./gemini.service');

/**
 * Transforms a Mongoose Case document into a safe, public view (§5.3 Solution Secrecy).
 * Absolutely no solution data, pointsTo, isKey, unrevealed clues or hints are leaked.
 */
function toPublicCase(caseDoc) {
  const discoveredIds = new Set(caseDoc.progress?.discoveredClueIds || []);
  const revealedIds = new Set(caseDoc.progress?.revealedHintIds || []);

  const publicSuspects = (caseDoc.suspects || []).map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    description: s.description,
    alibi: s.alibi
  }));

  const publicClues = (caseDoc.clues || []).map((c) => {
    const isDiscovered = discoveredIds.has(c.id);
    return {
      id: c.id,
      title: c.title,
      location: c.location,
      type: c.type || 'forensic',
      discovered: isDiscovered,
      ...(isDiscovered ? { text: c.text } : {})
    };
  });

  const revealedHints = (caseDoc.hints || [])
    .filter((h) => revealedIds.has(h.id))
    .sort((a, b) => a.level - b.level)
    .map((h) => ({
      id: h.id,
      level: h.level,
      text: h.text
    }));

  const hintsUsed = caseDoc.progress?.hintsUsed || revealedHints.length;
  const cluesDiscovered = discoveredIds.size;
  const cluesTotal = caseDoc.clues?.length || 0;

  return {
    id: caseDoc.publicId,
    title: caseDoc.title,
    difficulty: caseDoc.difficulty,
    story: caseDoc.story,
    suspects: publicSuspects,
    clues: publicClues,
    hints: {
      total: caseDoc.hints?.length || 0,
      used: hintsUsed,
      revealed: revealedHints
    },
    progress: {
      cluesDiscovered,
      cluesTotal
    },
    scorePreview: calculateScorePreview(cluesDiscovered, hintsUsed),
    status: caseDoc.status
  };
}

/**
 * Transforms a completed Case document into the final Result view (§9.6).
 */
function toResult(caseDoc) {
  if (caseDoc.status !== 'completed' || !caseDoc.accusation) {
    throw new AppError('CASE_NOT_COMPLETED', 'Case has not been completed yet', 409);
  }

  const suspectMap = new Map((caseDoc.suspects || []).map((s) => [s.id, s]));
  const culpritSuspect = suspectMap.get(caseDoc.solution?.culpritId) || {
    id: caseDoc.solution?.culpritId,
    name: 'Unknown',
    role: 'Unknown'
  };

  const discoveredIds = new Set(caseDoc.progress?.discoveredClueIds || []);
  const keyClueIds = new Set(caseDoc.solution?.keyClueIds || []);

  const keyClues = (caseDoc.clues || [])
    .filter((c) => keyClueIds.has(c.id) || c.isKey)
    .map((c) => ({
      id: c.id,
      title: c.title,
      text: c.text,
      foundByPlayer: discoveredIds.has(c.id)
    }));

  return {
    verdict: caseDoc.accusation.isCorrect ? 'correct' : 'incorrect',
    accusedSuspectId: caseDoc.accusation.suspectId,
    culprit: {
      id: culpritSuspect.id,
      name: culpritSuspect.name,
      role: culpritSuspect.role
    },
    explanation: {
      motive: caseDoc.solution?.motive,
      method: caseDoc.solution?.method,
      opportunity: caseDoc.solution?.opportunity,
      summary: caseDoc.solution?.explanation
    },
    keyClues,
    score: caseDoc.score,
    stats: {
      cluesDiscovered: discoveredIds.size,
      cluesTotal: caseDoc.clues?.length || 0,
      hintsUsed: caseDoc.progress?.hintsUsed || 0
    }
  };
}

/**
 * Business logic: Create a new mystery
 */
async function createCase({ premise, difficulty }) {
  // Generate mystery via Gemini service with retries and domain verification
  const { mystery, meta } = await generateMysteryWithAI(premise, difficulty);

  // Generate 16-char unguessable publicId
  const publicId = nanoid(16);

  // Persist case in MongoDB
  const caseDoc = new Case({
    publicId,
    premise,
    difficulty,
    status: 'active',
    title: mystery.title,
    story: mystery.story,
    suspects: mystery.suspects,
    clues: mystery.clues,
    hints: mystery.hints,
    solution: mystery.solution,
    progress: {
      discoveredClueIds: [],
      hintsUsed: 0,
      revealedHintIds: []
    },
    meta
  });

  await caseDoc.save();
  return toPublicCase(caseDoc);
}

/**
 * Business logic: Retrieve a case by publicId
 */
async function getCaseByPublicId(publicId) {
  const caseDoc = await Case.findOne({ publicId });
  if (!caseDoc) {
    throw new AppError('CASE_NOT_FOUND', `Case with ID '${publicId}' not found`, 404);
  }
  return toPublicCase(caseDoc);
}

/**
 * Business logic: Discover a clue (Idempotent, atomic update)
 */
async function discoverClue(publicId, clueId) {
  const caseDoc = await Case.findOne({ publicId });
  if (!caseDoc) {
    throw new AppError('CASE_NOT_FOUND', `Case with ID '${publicId}' not found`, 404);
  }

  if (caseDoc.status === 'completed') {
    throw new AppError('CASE_COMPLETED', 'Cannot discover clues on a completed case', 409);
  }

  const targetClue = caseDoc.clues.find((c) => c.id === clueId);
  if (!targetClue) {
    throw new AppError('CLUE_NOT_FOUND', `Clue '${clueId}' does not exist for this case`, 404);
  }

  const alreadyDiscovered = caseDoc.progress.discoveredClueIds.includes(clueId);

  if (!alreadyDiscovered) {
    // Atomic push to prevent race conditions
    await Case.updateOne(
      { publicId, status: 'active' },
      { $addToSet: { 'progress.discoveredClueIds': clueId } }
    );
    caseDoc.progress.discoveredClueIds.push(clueId);
  }

  const cluesDiscovered = caseDoc.progress.discoveredClueIds.length;
  const cluesTotal = caseDoc.clues.length;

  return {
    clue: {
      id: targetClue.id,
      title: targetClue.title,
      location: targetClue.location,
      discovered: true,
      text: targetClue.text
    },
    progress: {
      cluesDiscovered,
      cluesTotal
    },
    scorePreview: calculateScorePreview(cluesDiscovered, caseDoc.progress.hintsUsed),
    alreadyDiscovered
  };
}

/**
 * Business logic: Request the next hint
 */
async function requestHint(publicId) {
  const caseDoc = await Case.findOne({ publicId });
  if (!caseDoc) {
    throw new AppError('CASE_NOT_FOUND', `Case with ID '${publicId}' not found`, 404);
  }

  if (caseDoc.status === 'completed') {
    throw new AppError('CASE_COMPLETED', 'Cannot request hints on a completed case', 409);
  }

  const totalHints = caseDoc.hints.length;
  const hintsUsed = caseDoc.progress.hintsUsed;

  if (hintsUsed >= totalHints) {
    throw new AppError('NO_HINTS_LEFT', 'All available hints have been revealed', 409);
  }

  // Find next unrevealed hint in ascending level order
  const revealedSet = new Set(caseDoc.progress.revealedHintIds);
  const unrevealedHints = caseDoc.hints
    .filter((h) => !revealedSet.has(h.id))
    .sort((a, b) => a.level - b.level);

  if (unrevealedHints.length === 0) {
    throw new AppError('NO_HINTS_LEFT', 'No more unrevealed hints remain', 409);
  }

  const nextHint = unrevealedHints[0];

  // Atomically update progress
  await Case.updateOne(
    { publicId, status: 'active' },
    {
      $addToSet: { 'progress.revealedHintIds': nextHint.id },
      $inc: { 'progress.hintsUsed': 1 }
    }
  );

  const updatedHintsUsed = hintsUsed + 1;
  const cluesDiscovered = caseDoc.progress.discoveredClueIds.length;

  return {
    hint: {
      id: nextHint.id,
      level: nextHint.level,
      text: nextHint.text
    },
    hints: {
      total: totalHints,
      used: updatedHintsUsed
    },
    scorePreview: calculateScorePreview(cluesDiscovered, updatedHintsUsed)
  };
}

/**
 * Business logic: Submit an accusation (§9.5)
 */
async function submitAccusation(publicId, suspectId) {
  // Explicitly select solution fields since they have select: false
  const caseDoc = await Case.findOne({ publicId }).select('+solution +clues.isKey');
  if (!caseDoc) {
    throw new AppError('CASE_NOT_FOUND', `Case with ID '${publicId}' not found`, 404);
  }

  if (caseDoc.status === 'completed') {
    throw new AppError('CASE_COMPLETED', 'Case has already been completed', 409);
  }

  const suspectExists = caseDoc.suspects.some((s) => s.id === suspectId);
  if (!suspectExists) {
    throw new AppError('VALIDATION_ERROR', `Suspect '${suspectId}' does not exist in this case`, 400);
  }

  const isCorrect = caseDoc.solution.culpritId === suspectId;
  const cluesDiscoveredCount = caseDoc.progress.discoveredClueIds.length;
  const hintsUsedCount = caseDoc.progress.hintsUsed;

  const score = calculateFinalScore({
    difficulty: caseDoc.difficulty,
    isCorrect,
    cluesDiscoveredCount,
    cluesTotal: caseDoc.clues.length,
    hintsUsedCount
  });

  // Conditional update with status: 'active' prevents race conditions on double accusation
  const updatedDoc = await Case.findOneAndUpdate(
    { publicId, status: 'active' },
    {
      $set: {
        status: 'completed',
        accusation: {
          suspectId,
          isCorrect,
          accusedAt: new Date()
        },
        score
      }
    },
    { new: true }
  ).select('+solution +clues.isKey');

  if (!updatedDoc) {
    throw new AppError('CASE_COMPLETED', 'Accusation already submitted concurrently', 409);
  }

  return toResult(updatedDoc);
}

/**
 * Business logic: Retrieve results for completed case (§9.6)
 */
async function getCaseResult(publicId) {
  const caseDoc = await Case.findOne({ publicId }).select('+solution +clues.isKey');
  if (!caseDoc) {
    throw new AppError('CASE_NOT_FOUND', `Case with ID '${publicId}' not found`, 404);
  }

  if (caseDoc.status !== 'completed') {
    throw new AppError('CASE_NOT_COMPLETED', 'Case has not been completed yet', 409);
  }

  return toResult(caseDoc);
}

module.exports = {
  toPublicCase,
  toResult,
  createCase,
  getCaseByPublicId,
  discoverClue,
  requestHint,
  submitAccusation,
  getCaseResult
};
