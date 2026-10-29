const { ZodError } = require('zod');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details
      }
    });
  }

  // Known custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || []
      }
    });
  }

  // SyntaxError from invalid JSON payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Malformed JSON payload',
        details: []
      }
    });
  }

  // Rate limit error (from express-rate-limit if handled here)
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        details: []
      }
    });
  }

  // Unexpected internal errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled server error');

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred. Please try again later.',
      details: []
    }
  });
};

module.exports = errorHandler;
