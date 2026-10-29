const express = require('express');
const rateLimit = require('express-rate-limit');
const casesController = require('../controllers/cases.controller');
const { validateBody } = require('../middleware/validate');
const {
  createCaseRequestSchema,
  accuseRequestSchema
} = require('../schemas/requests.schema');

const router = express.Router();

// Specific rate limiter for AI generation endpoint (§14.3: 5 requests / 10 min / IP)
const createCaseLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many case generation requests. Please wait a few minutes before trying again.',
        details: []
      }
    });
  }
});

// POST /api/cases - Generate a mystery
router.post(
  '/cases',
  createCaseLimiter,
  validateBody(createCaseRequestSchema),
  casesController.createCase
);

// GET /api/cases/:id - Retrieve public active case
router.get('/cases/:id', casesController.getCase);

// POST /api/cases/:id/clues/:clueId/discover - Discover clue
router.post('/cases/:id/clues/:clueId/discover', casesController.discoverClue);

// POST /api/cases/:id/hints - Request next hint
router.post('/cases/:id/hints', casesController.requestHint);

// POST /api/cases/:id/accuse - Accuse suspect
router.post(
  '/cases/:id/accuse',
  validateBody(accuseRequestSchema),
  casesController.submitAccusation
);

// GET /api/cases/:id/result - View case result
router.get('/cases/:id/result', casesController.getResult);

module.exports = router;
