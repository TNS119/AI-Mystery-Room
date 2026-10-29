const DIFFICULTY_CONFIG = {
  easy: {
    suspects: 3,
    clues: 5,
    hints: 2,
    basePoints: 100,
    maxScore: 125,
    minKeyClues: 2,
    redHerrings: 0
  },
  medium: {
    suspects: 4,
    clues: 7,
    hints: 3,
    basePoints: 150,
    maxScore: 185,
    minKeyClues: 3,
    redHerrings: 1
  },
  hard: {
    suspects: 5,
    clues: 9,
    hints: 3,
    basePoints: 200,
    maxScore: 245,
    minKeyClues: 3,
    redHerrings: 2
  }
};

const CLUE_BONUS = 5;
const HINT_PENALTY = 10;
const MIN_SCORE = 0;

/**
 * Calculates in-progress score preview (excluding base points)
 * Clamped to >= 0
 */
function calculateScorePreview(cluesDiscoveredCount = 0, hintsUsedCount = 0) {
  const bonus = cluesDiscoveredCount * CLUE_BONUS;
  const penalty = hintsUsedCount * HINT_PENALTY;
  return Math.max(MIN_SCORE, bonus - penalty);
}

/**
 * Calculates final score upon accusation (§11)
 *
 * @param {Object} params
 * @param {string} params.difficulty - 'easy' | 'medium' | 'hard'
 * @param {boolean} params.isCorrect - whether accusation matched culprit
 * @param {number} params.cluesDiscoveredCount - unique clues discovered
 * @param {number} params.cluesTotal - total clues available in case
 * @param {number} params.hintsUsedCount - hints revealed
 * @returns {Object} { base, cluesBonus, hintsPenalty, total, max }
 */
function calculateFinalScore({
  difficulty,
  isCorrect,
  cluesDiscoveredCount = 0,
  cluesTotal,
  hintsUsedCount = 0
}) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  const totalClues = cluesTotal || config.clues;

  const base = isCorrect ? config.basePoints : 0;
  const cluesBonus = cluesDiscoveredCount * CLUE_BONUS;
  const hintsPenalty = hintsUsedCount * HINT_PENALTY;
  const total = Math.max(MIN_SCORE, base + cluesBonus - hintsPenalty);
  const max = config.basePoints + totalClues * CLUE_BONUS;

  return {
    base,
    cluesBonus,
    hintsPenalty,
    total,
    max
  };
}

module.exports = {
  DIFFICULTY_CONFIG,
  CLUE_BONUS,
  HINT_PENALTY,
  MIN_SCORE,
  calculateScorePreview,
  calculateFinalScore
};
