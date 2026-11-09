/**
 * OmniMarket AI - Centralized Error Handling Middleware
 */

const logger = require('../utils/logger');
const { errorResponse } = require('../utils/apiResponse');

// Async handler to eliminate try-catch boilerplate in controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? (err.statusCode || 500) : res.statusCode;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return errorResponse(res, {
      statusCode: 400,
      message: messages.join(', '),
      code: 'VALIDATION_ERROR'
    });
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return errorResponse(res, {
      statusCode: 409,
      message: `An account or record with that ${field} already exists.`,
      code: 'DUPLICATE_KEY_ERROR'
    });
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Invalid authorization token.',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Authorization token has expired.',
      code: 'TOKEN_EXPIRED'
    });
  }

  return errorResponse(res, {
    statusCode,
    message,
    error: process.env.NODE_ENV !== 'production' ? err : undefined,
    code: err.code || 'SERVER_ERROR'
  });
};

module.exports = {
  asyncHandler,
  notFound,
  errorHandler
};
