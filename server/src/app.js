const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const env = require('./config/env');
const logger = require('./utils/logger');
const healthRoutes = require('./routes/health.routes');
const casesRoutes = require('./routes/cases.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Vercel, Fly)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Security headers
app.use(helmet());

// CORS configuration
const allowedOrigins = env.CLIENT_URL.split(',').map((url) => url.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  })
);

// Logging middleware
if (env.NODE_ENV !== 'test') {
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/health'
      }
    })
  );
}

// Body parsing with 10kb limit (§14.1)
app.use(express.json({ limit: '10kb' }));

// General rate limiter for all /api routes (§14.3)
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 120, // 120 requests / 10 min
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please try again later.',
        details: []
      }
    });
  }
});

app.use('/api', generalLimiter);

// Health check endpoint
app.use('/api', healthRoutes);

// Cases endpoints
app.use('/api', casesRoutes);

// Fallback 404 handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

module.exports = app;
