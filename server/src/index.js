const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function startServer() {
  // Connect database
  await connectDB();

  server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `Server running on port ${env.PORT}`);
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutdown signal received. Closing HTTP server and DB connections...');
    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDB();
        process.exit(0);
      });
    } else {
      await disconnectDB();
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled Rejection at Promise');
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught Exception thrown');
    shutdown('uncaughtException');
  });
}

startServer();
