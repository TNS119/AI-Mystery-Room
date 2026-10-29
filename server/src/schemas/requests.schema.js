const { z } = require('zod');

// Strip non-printable / control characters from premise (§14.4)
const cleanString = (val) =>
  typeof val === 'string'
    ? val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
    : val;

const createCaseRequestSchema = z.object({
  premise: z.preprocess(
    cleanString,
    z
      .string({ required_error: 'Premise is required' })
      .min(10, 'Premise must be at least 10 characters long')
      .max(300, 'Premise must not exceed 300 characters')
  ),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: "Difficulty must be one of 'easy', 'medium', or 'hard'"
  })
}).strict();

const accuseRequestSchema = z.object({
  suspectId: z
    .string({ required_error: 'suspectId is required' })
    .regex(/^s\d+$/, 'Invalid suspect ID format (e.g. s1, s2)')
}).strict();

module.exports = {
  createCaseRequestSchema,
  accuseRequestSchema
};
