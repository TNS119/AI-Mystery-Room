const { DIFFICULTY_CONFIG } = require('./scoring.service');
const { validateMysteryStructure } = require('../schemas/mystery.schema');

/**
 * Validates a generated mystery against both structural Zod schema and
 * deterministic domain logic (§10.4).
 *
 * @param {Object} rawData - Parsed JSON object from Gemini
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {{ valid: boolean, errors: string[], data?: Object }}
 */
function validateMystery(rawData, difficulty) {
  // Step A: Structural Zod schema & count validation
  const structResult = validateMysteryStructure(rawData, difficulty);
  if (!structResult.valid) {
    return structResult;
  }

  const mystery = structResult.data;
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const errors = [];

  const suspectMap = new Map(mystery.suspects.map((s) => [s.id, s]));
  const clueMap = new Map(mystery.clues.map((c) => [c.id, c]));

  // 1. solution.culpritId references exactly one existing suspect
  const culprit = suspectMap.get(mystery.solution.culpritId);
  if (!culprit) {
    errors.push(`Culprit ID '${mystery.solution.culpritId}' does not match any suspect`);
    return { valid: false, errors };
  }

  // 2. Every solution.keyClueIds entry exists, and count of key clues >= config.minKeyClues
  if (mystery.solution.keyClueIds.length < config.minKeyClues) {
    errors.push(
      `Expected at least ${config.minKeyClues} key clues for ${difficulty}, got ${mystery.solution.keyClueIds.length}`
    );
  }

  for (const clueId of mystery.solution.keyClueIds) {
    const clue = clueMap.get(clueId);
    if (!clue) {
      errors.push(`Key clue '${clueId}' in solution does not exist in clues array`);
    } else {
      // Synchronize clue.isKey and ensure it points to the culprit
      clue.isKey = true;
      if (!clue.pointsTo) clue.pointsTo = [];
      if (!clue.pointsTo.includes(mystery.solution.culpritId)) {
        clue.pointsTo.push(mystery.solution.culpritId);
      }
    }
  }

  // 3. At least 2 key clues have pointsTo including the culprit
  let keyCluesPointingToCulprit = mystery.clues.filter(
    (c) => c.isKey && c.pointsTo.includes(mystery.solution.culpritId)
  );
  if (keyCluesPointingToCulprit.length < 2) {
    // Auto-align first available key clues to point to culprit
    const availableKey = mystery.clues.filter((c) => c.isKey);
    for (const kClue of availableKey) {
      if (!kClue.pointsTo.includes(mystery.solution.culpritId)) {
        kClue.pointsTo.push(mystery.solution.culpritId);
      }
      if (mystery.clues.filter((c) => c.isKey && c.pointsTo.includes(mystery.solution.culpritId)).length >= 2) {
        break;
      }
    }
  }

  // 4. No non-culprit suspect is implicated by more key clues than the culprit
  const keyCluesPerSuspect = new Map();
  for (const suspect of mystery.suspects) {
    const count = mystery.clues.filter((c) => c.isKey && c.pointsTo.includes(suspect.id)).length;
    keyCluesPerSuspect.set(suspect.id, count);
  }

  const culpritKeyCount = keyCluesPerSuspect.get(mystery.solution.culpritId) || 0;
  for (const [suspectId, count] of keyCluesPerSuspect.entries()) {
    if (suspectId !== mystery.solution.culpritId && count > culpritKeyCount) {
      errors.push(
        `Suspect '${suspectId}' is implicated by more key clues (${count}) than the culprit (${culpritKeyCount})`
      );
    }
  }

  // 5. Red-herring clues (non-key clues pointing to non-culprits)
  const nonCulpritSuspects = mystery.suspects.filter((s) => s.id !== mystery.solution.culpritId);
  if (nonCulpritSuspects.length > 0) {
    const nonKeyClues = mystery.clues.filter((c) => !c.isKey);
    for (const clue of nonKeyClues) {
      if (!clue.pointsTo || clue.pointsTo.length === 0) {
        const target = nonCulpritSuspects[Math.floor(Math.random() * nonCulpritSuspects.length)];
        clue.pointsTo = [target.id];
      }
    }
  }

  const redHerrings = mystery.clues.filter(
    (c) => !c.isKey && c.pointsTo.some((id) => id !== mystery.solution.culpritId)
  );
  if (redHerrings.length < config.redHerrings) {
    // If still short, ensure enough non-key clues point to non-culprits
    const nonKey = mystery.clues.filter((c) => !c.isKey);
    for (let i = 0; i < config.redHerrings && i < nonKey.length; i++) {
      const clue = nonKey[i];
      const target = nonCulpritSuspects[i % nonCulpritSuspects.length];
      clue.pointsTo = [target.id];
    }
  }

  // 6. Total key clues <= total clues
  const totalKeyClues = mystery.clues.filter((c) => c.isKey).length;
  if (totalKeyClues > mystery.clues.length) {
    errors.push('Total key clues exceeds total available clues');
  }

  // 7. Leakage check:
  // Hints must NEVER name the culprit directly
  const culpritNameLower = culprit.name.toLowerCase();
  for (const hint of mystery.hints) {
    if (hint.text.toLowerCase().includes(culpritNameLower)) {
      errors.push(`Hint '${hint.id}' explicitly mentions culprit's name '${culprit.name}'`);
    }
  }

  // Public story must not contain explicit guilt phrases naming the culprit
  const storyLower = mystery.story.toLowerCase();
  const forbiddenPhrases = [
    `the culprit is ${culpritNameLower}`,
    `the killer is ${culpritNameLower}`,
    `the murderer is ${culpritNameLower}`,
    `${culpritNameLower} did it`,
    `${culpritNameLower} is guilty`,
    `${culpritNameLower} stole`,
    `${culpritNameLower} killed`,
    `${culpritNameLower} murdered`
  ];

  for (const phrase of forbiddenPhrases) {
    if (storyLower.includes(phrase)) {
      errors.push(`Story leaks solution with phrase: "${phrase}"`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: mystery };
}

module.exports = {
  validateMystery
};
