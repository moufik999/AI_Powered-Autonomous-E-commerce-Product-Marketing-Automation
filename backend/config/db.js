/**
 * OmniMarket AI - Database Configuration
 * MongoDB Atlas Connection with Mongoose
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Fallback URI for local development or demo fallback
const DEFAULT_MONGO_URI = 'mongodb+srv://moufik391:moufik391@cluster0.edolatd.mongodb.net/omnimarket_auth_db?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    // Fix potential MongoDB Atlas SRV lookup DNS issue
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      logger.warn('Custom DNS setup skipped:', dnsErr.message);
    }

    let uri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

    // Ensure database name is present in URI if trailing slash is provided
    if (uri && uri.endsWith('/')) {
      uri = `${uri}omnimarket_auth_db?retryWrites=true&w=majority`;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });

    logger.info(`MongoDB Atlas Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB Runtime Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Atlas disconnected. Attempting reconnection...');
    });

    return conn;
  } catch (error) {
    logger.error(`Database Connection Failed: ${error.message}`);
    // Non-fatal exit or rethrow so server startup can decide
    throw error;
  }
};

module.exports = connectDB;
