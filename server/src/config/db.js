const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

// Ensure MongoDB Atlas SRV records resolve reliably across Windows/ISP DNS resolvers
if (env.MONGODB_URI && env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    logger.warn({ err: dnsErr }, 'Could not set custom DNS servers for SRV resolution');
  }
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    logger.info({ host: conn.connection.host }, 'MongoDB connected successfully');
    return conn;
  } catch (error) {
    logger.error({ err: error.message }, 'MongoDB connection error');
    // If running in development and no DB is available, do not crash immediately so health checks can still be verified
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error({ err: error.message }, 'Error disconnecting MongoDB');
  }
};

module.exports = { connectDB, disconnectDB };
