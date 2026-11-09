/**
 * OmniMarket AI - Authentication Controller
 * Handles HTTP requests for user registration, login, and profile retrieval.
 */

const authService = require('../services/authService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Register new user
exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.register({ email, password });

  logger.info(`✓ New User Registered: ${result.user.email}`);

  return successResponse(res, {
    statusCode: 201,
    message: 'User registered successfully',
    token: result.token,
    user: result.user
  });
});

// Login existing user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  logger.info(`✓ User Logged In: ${result.user.email}`);

  return successResponse(res, {
    statusCode: 200,
    message: 'Login successful',
    token: result.token,
    user: result.user
  });
});

// Get current logged-in user profile
exports.getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  return successResponse(res, {
    statusCode: 200,
    user
  });
});
