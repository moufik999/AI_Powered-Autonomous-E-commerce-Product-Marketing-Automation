/**
 * OmniMarket AI - Authentication & Authorization Middleware
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_random_key_min_64_characters_long_for_security';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Access denied. No authentication token provided.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'The user belonging to this token no longer exists.',
        code: 'USER_NOT_FOUND'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    return errorResponse(res, {
      statusCode: 401,
      message: 'Invalid authorization token.',
      code: 'INVALID_TOKEN'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
