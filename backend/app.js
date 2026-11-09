/**
 * OmniMarket AI - Express Application Setup
 * Configures middleware, security, and routes.
 * Decoupled from server startup for clean testing and modularity.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
const productRoutes = require('./routes/productRoutes');
const photocardRoutes = require('./routes/photocardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

// 1. Strict & Resilient CORS Configuration
const allowedOrigins = [
  'https://ai-powered-autonomous-client.vercel.app',
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    // Exact origin match
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Match any client preview deployments on Vercel
    if (/^https:\/\/ai-powered-autonomous-client(-[a-z0-9-]+)?\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }

    // Reject disallowed origins without throwing an unhandled Express error
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Register CORS middleware before all parsers and API routes
app.use(cors(corsOptions));

// Explicit preflight handler ensuring OPTIONS requests are handled with 204 and NEVER redirected
app.options('*', cors(corsOptions));

// Guard against any accidental redirect on OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 2. Request Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 3. Request Logging (Debug in development)
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// 4. System Health Check & Root Endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'OmniMarket AI Backend API',
    frontend: 'http://localhost:3000',
    documentation: {
      health: '/health',
      photocard: '/api/photocard',
      ai: '/api/ai',
      facebook: '/api/facebook'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'OmniMarket AI Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// 4.5. Database Connection Middleware (Resilient for Serverless & Long-Running Environments)
app.use(async (req, res, next) => {
  // Preflight requests and static health checks do not require database connection
  if (req.method === 'OPTIONS' || req.path === '/' || req.path === '/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (dbErr) {
    logger.error(`Database Connection Middleware Error: ${dbErr.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB Atlas allows access from all IP addresses (0.0.0.0/0).',
      code: 'DB_CONNECTION_ERROR',
      error: dbErr.message
    });
  }
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/products', productRoutes);
app.use('/api/photocard', photocardRoutes);

// 6. Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
