/**
 * OmniMarket AI - Database Configuration
 * MongoDB Atlas Connection with Mongoose & Serverless Connection Caching
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Fallback URI for local development or demo fallback
const DEFAULT_MONGO_URI = 'mongodb+srv://moufik391:moufik391@cluster0.edolatd.mongodb.net/omnimarket_auth_db?retryWrites=true&w=majority';

// Global cache for serverless environments (e.g. Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // 1. Return existing healthy connection if already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. Only override DNS on local Windows environments, NEVER in production or on Vercel
  if (process.platform === 'win32' && !process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    try {
      dns.setServers(['8.8.8.8', '8.8.4.4']);
    } catch (dnsErr) {
      logger.warn('Custom DNS setup skipped:', dnsErr.message);
    }
  }

  // 3. Clean and sanitize the MongoDB URI
  let rawUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;
  let uri = String(rawUri).trim();

  // Strip accidental quotes or markdown formatting
  uri = uri.replace(/^["']|["']$/g, '').replace(/\[(.*?)\]\((.*?)\)/g, '$1');

  // Ensure database name is present in URI if trailing slash is provided
  if (uri && uri.endsWith('/')) {
    uri = `${uri}omnimarket_auth_db?retryWrites=true&w=majority`;
  }

  // 4. Initialize or reuse connection promise
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      logger.info(`MongoDB Atlas Connected: ${m.connection.host} (Database: ${m.connection.name})`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    logger.error(`Database Connection Failed: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

module.exports = connectDB;
