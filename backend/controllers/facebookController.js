/**
 * OmniMarket AI - Facebook Controller
 * Handles dedicated Meta Facebook publishing, page diagnostics, and post history.
 */

const facebookService = require('../services/facebookService');
const MarketingContent = require('../models/MarketingContent');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Publish post (text or image) to Facebook Page
exports.publish = asyncHandler(async (req, res) => {
  const { caption, imageUrl = null, platform = 'Facebook' } = req.body;

  const result = await facebookService.publishPost({
    caption,
    imageUrl
  });

  // Track publication in database if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await MarketingContent.create({
        user: req.user?._id || null,
        caption,
        imageUrl,
        platform,
        status: 'published',
        facebookPostId: result.postId,
        publishedAt: new Date()
      });
    } catch (err) {
      logger.debug('Could not persist published record:', err.message);
    }
  }

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    postId: result.postId,
    data: result.data
  });
});

// Get Facebook Page connection status and verification
exports.getPageStatus = asyncHandler(async (req, res) => {
  const status = await facebookService.getPageStatus();

  return successResponse(res, {
    statusCode: 200,
    status
  });
});

// Get publishing history
exports.getPublishedHistory = asyncHandler(async (req, res) => {
  const filter = { platform: 'Facebook' };
  if (req.user) {
    filter.user = req.user._id;
  }

  const history = await MarketingContent.find(filter)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('product', 'title price category');

  return successResponse(res, {
    statusCode: 200,
    count: history.length,
    history
  });
});
