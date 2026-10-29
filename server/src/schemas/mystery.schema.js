const { z } = require('zod');
const { DIFFICULTY_CONFIG } = require('../services/scoring.service');

const suspectIdRegex = /^s\d+$/;
const clueIdRegex = /^c\d+$/;
const hintIdRegex = /^h\d+$/;

const suspectSchema = z.object({
  id: z.string().regex(suspectIdRegex, 'Suspect ID must match pattern s1, s2, etc.'),
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  description: z.string().min(5).max(1000),
  alibi: z.string().min(5).max(1000)
});

const clueSchema = z.object({
  id: z.string().regex(clueIdRegex, 'Clue ID must match pattern c1, c2, etc.'),
  title: z.string().min(2).max(150),
  location: z.string().min(1).max(150),
  type: z.string().default('forensic'),
  text: z.string().min(5).max(1000),
  pointsTo: z.array(z.string().regex(suspectIdRegex)).default([]),
  isKey: z.boolean().default(false),
  significance: z.string().min(1).max(1000).default('Key evidence')
});

const hintSchema = z.object({
  id: z.string().regex(hintIdRegex, 'Hint ID must match pattern h1, h2, etc.'),
  level: z.number().int().min(1),
  text: z.string().min(5).max(1000)
});

const solutionSchema = z.object({
  culpritId: z.string().regex(suspectIdRegex),
  motive: z.string().min(5).max(1000),
  method: z.string().min(5).max(1000),
  opportunity: z.string().min(5).max(1000),
  explanation: z.string().min(30).max(3000),
  keyClueIds: z.array(z.string().regex(clueIdRegex)).min(2)
});

const rawMysterySchema = z.object({
  title: z.string().min(2).max(150),
  story: z.string().min(100).max(5000),
  suspects: z.array(suspectSchema),
  clues: z.array(clueSchema),
  hints: z.array(hintSchema),
  solution: solutionSchema
});

/**
 * Validates raw AI output against structural and difficulty-specific constraints
 */
function validateMysteryStructure(data, difficulty) {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;

  // Base Zod parse
  const parsed = rawMysterySchema.safeParse(data);
  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    };
  }

  const mystery = parsed.data;
  const errors = [];

  // Check counts against difficulty table
  if (mystery.suspects.length !== config.suspects) {
    errors.push(
      `Expected ${config.suspects} suspects for difficulty '${difficulty}', got ${mystery.suspects.length}`
    );
  }
  if (mystery.clues.length !== config.clues) {
    errors.push(
      `Expected ${config.clues} clues for difficulty '${difficulty}', got ${mystery.clues.length}`
    );
  }
  if (mystery.hints.length !== config.hints) {
    errors.push(
      `Expected ${config.hints} hints for difficulty '${difficulty}', got ${mystery.hints.length}`
    );
  }

  // Check unique IDs
  const suspectIds = new Set(mystery.suspects.map((s) => s.id));
  if (suspectIds.size !== mystery.suspects.length) {
    errors.push('Suspect IDs must be unique');
  }

  const clueIds = new Set(mystery.clues.map((c) => c.id));
  if (clueIds.size !== mystery.clues.length) {
    errors.push('Clue IDs must be unique');
  }

  const hintIds = new Set(mystery.hints.map((h) => h.id));
  if (hintIds.size !== mystery.hints.length) {
    errors.push('Hint IDs must be unique');
  }

  // Check hints levels are ascending from 1
  const sortedLevels = mystery.hints.map((h) => h.level).sort((a, b) => a - b);
  for (let i = 0; i < sortedLevels.length; i++) {
    if (sortedLevels[i] !== i + 1) {
      errors.push(`Hint levels must be ascending starting from 1 (expected ${i + 1}, got ${sortedLevels[i]})`);
      break;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: mystery };
}

module.exports = {
  rawMysterySchema,
  validateMysteryStructure
};
