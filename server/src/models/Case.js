const mongoose = require('mongoose');

const suspectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    alibi: { type: String, required: true }
  },
  { _id: false }
);

const clueSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, default: 'forensic' },
    text: { type: String, required: true },
    pointsTo: { type: [String], select: false },
    isKey: { type: Boolean, select: false },
    significance: { type: String, select: false }
  },
  { _id: false }
);

const hintSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    level: { type: Number, required: true },
    text: { type: String, required: true }
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    culpritId: { type: String, required: true },
    motive: { type: String, required: true },
    method: { type: String, required: true },
    opportunity: { type: String, required: true },
    explanation: { type: String, required: true },
    keyClueIds: { type: [String], required: true }
  },
  { _id: false }
);

const caseSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    premise: { type: String, required: true, minlength: 10, maxlength: 300 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },

    title: { type: String, required: true },
    story: { type: String, required: true },

    suspects: { type: [suspectSchema], required: true },
    clues: { type: [clueSchema], required: true },
    hints: { type: [hintSchema], required: true },

    solution: { type: solutionSchema, required: true, select: false },

    progress: {
      discoveredClueIds: { type: [String], default: [] },
      hintsUsed: { type: Number, default: 0 },
      revealedHintIds: { type: [String], default: [] }
    },

    accusation: {
      suspectId: { type: String },
      isCorrect: { type: Boolean },
      accusedAt: { type: Date }
    },

    score: {
      base: { type: Number },
      cluesBonus: { type: Number },
      hintsPenalty: { type: Number },
      total: { type: Number },
      max: { type: Number }
    },

    meta: {
      model: { type: String },
      generationMs: { type: Number },
      promptVersion: { type: String },
      verified: { type: Boolean }
    },

    expiresAt: {
      type: Date,
      index: { expires: 0 },
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  {
    timestamps: true
  }
);

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
