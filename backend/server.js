/**
 * OmniMarket AI - Server Startup & Lifecycle Management
 * Handles environment loading, DNS resolution, database connection, and HTTP listening.
 */

const dns = require('dns');
const path = require('path');

// 1. Load Environment Variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2. DNS Resolution Fix for MongoDB SRV on some ISPs / Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('DNS server override warning:', dnsErr.message);
}

const app = require('./app');
const connectDB = require('./config/db');
const productService = require('./services/productService');
const templateService = require('./services/templateService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// 3. Initialize Database and Start Server
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Auto-seed default products for RAG if empty
    await productService.seedDefaultProducts();

    // Auto-seed default category templates for Photocard generator
    await templateService.ensureTemplatesSeeded();

    // Start HTTP Server
    const server = app.listen(PORT, () => {
      logger.info(`==================================================`);
      logger.info(`⚡ OmniMarket AI Backend Server running successfully`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`🩺 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🛡️ Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`==================================================`);
    });

    // Graceful Shutdown Handlers
    const shutdown = (signal) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      // Force close after 10s timeout
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
    });

    return server;
  } catch (error) {
    logger.error('Server Initialization Failed:', error.message);
    process.exit(1);
  }
};

// Start the server
const serverInstance = startServer();

module.exports = serverInstance;
