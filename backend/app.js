/**
 * OmniMarket AI - Express Application Setup
 * Configures middleware, security, and routes.
 * Decoupled from server startup for clean testing and modularity.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
const productRoutes = require('./routes/productRoutes');
const photocardRoutes = require('./routes/photocardRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

// 1. CORS Configuration
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
    if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev/demo
    }
  },
  credentials: true
}));

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
