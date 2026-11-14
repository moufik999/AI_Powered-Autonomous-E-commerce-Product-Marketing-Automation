/**
 * OmniMarket AI - Facebook Controller
 * Handles dedicated Meta Facebook publishing, page diagnostics, post history,
 * and Meta Graph API Webhook automation (verification, event ingestion, and auto-reply rules).
 */

const facebookService = require('../services/facebookService');
const autoReplyService = require('../services/autoReplyService');
const facebookConfig = require('../config/facebook');
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

/**
 * Meta Graph API Webhook GET Validation Endpoint
 * Validates hub.mode, hub.verify_token, and responds with hub.challenge
 */
exports.verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'] || (req.query.hub && req.query.hub.mode);
  const token = req.query['hub.verify_token'] || (req.query.hub && req.query.hub.verify_token);
  const challenge = req.query['hub.challenge'] || (req.query.hub && req.query.hub.challenge);

  const expectedToken = facebookConfig.getVerifyToken();

  logger.info(`Received Meta Webhook Verification Request: mode=${mode}`);

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      logger.info('✓ Meta Webhook Token successfully validated. Responding with challenge.');
      return res.status(200).send(challenge);
    } else {
      logger.warn('✗ Meta Webhook Verification Failed: Token mismatch or invalid mode.');
      return res.status(403).send('Forbidden: Verify token mismatch');
    }
  }

  logger.warn('Meta Webhook Verification missing hub parameters.');
  return res.status(400).send('Bad Request: Missing hub parameters');
};

/**
 * Meta Graph API Webhook POST Event Ingestion Endpoint
 * Ingests incoming events (entry.messaging for inbox, entry.changes for feed/comments)
 */
exports.handleWebhook = asyncHandler(async (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  const body = req.body;

  if (body && body.object === 'page') {
    logger.info(`Processing incoming Meta Webhook Page events (${body.entry ? body.entry.length : 0} entries)`);
    
    // Process incoming events with AutoReplyService
    await autoReplyService.handleWebhookPayload(body);

    // Meta strictly expects HTTP 200 OK
    return res.status(200).send('EVENT_RECEIVED');
  }

  // Not a page event - acknowledge with 200 as Meta recommends
  return res.status(200).send('EVENT_RECEIVED');
});

/**
 * Get current Auto-Reply Rules and real-time execution statistics
 */
exports.getAutoReplyRules = asyncHandler(async (req, res) => {
  const data = await autoReplyService.getRules();

  return successResponse(res, {
    statusCode: 200,
    ...data
  });
});

/**
 * Update Auto-Reply Rules configuration (toggles and response text)
 */
exports.updateAutoReplyRules = asyncHandler(async (req, res) => {
  const {
    commentReplyEnabled,
    inboxReplyEnabled,
    commentReplyText,
    inboxReplyText
  } = req.body;

  const result = await autoReplyService.updateRules({
    commentReplyEnabled,
    inboxReplyEnabled,
    commentReplyText,
    inboxReplyText
  });

  return successResponse(res, {
    statusCode: 200,
    message: result.message,
    rules: result.rules
  });
});

/**
 * Simulate an incoming webhook event (Inbox or Comment) for live testing
 */
exports.testSimulateWebhook = asyncHandler(async (req, res) => {
  const { type = 'comment', testMessage, senderName } = req.body;

  const simulation = await autoReplyService.simulateWebhookEvent({
    type,
    testMessage,
    senderName
  });

  return successResponse(res, {
    statusCode: 200,
    message: `Simulated ${type} event processed successfully.`,
    simulation
  });
});
