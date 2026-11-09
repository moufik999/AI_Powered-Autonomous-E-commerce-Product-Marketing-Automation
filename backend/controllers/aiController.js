/**
 * OmniMarket AI - AI Controller
 * Manages post generation, RAG marketing generation, and legacy publish endpoint.
 * Preserves 100% backward compatibility for existing frontend calls.
 */

const aiService = require('../services/aiService');
const ragService = require('../services/ragService');
const facebookService = require('../services/facebookService');
const MarketingContent = require('../models/MarketingContent');
const mongoose = require('mongoose');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Generate standard marketing post
exports.generatePost = asyncHandler(async (req, res) => {
  const {
    productName,
    category,
    price,
    discount,
    details,
    prompt,
    platform = 'Facebook',
    tone
  } = req.body;

  const result = await aiService.generateMarketingPost({
    productName,
    category,
    price,
    discount,
    details,
    prompt,
    platform,
    tone
  });

  // Record generation draft if database is connected
  if (mongoose.connection.readyState === 1) {
    try {
      await MarketingContent.create({
        user: req.user?._id || null,
        prompt: productName ? `${productName} (${category || ''})` : prompt,
        caption: result.caption,
        platform,
        status: 'draft',
        metadata: { provider: result.provider }
      });
    } catch (err) {
      logger.debug('Could not save draft record:', err.message);
    }
  }

  // Preserve original response shape for backward compatibility
  return successResponse(res, {
    statusCode: 200,
    caption: result.caption,
    posts: [
      {
        caption: result.caption,
        platform: result.platform || 'Facebook'
      }
    ],
    provider: result.provider
  });
});

// Generate post using Retrieval-Augmented Generation (RAG)
exports.generateRAGPost = asyncHandler(async (req, res) => {
  const { prompt, productId = null, platform = 'Facebook', tone } = req.body;

  const result = await ragService.generateWithRAG({
    prompt,
    productId,
    platform,
    tone
  });

  // Record RAG draft if database is connected
  if (mongoose.connection.readyState === 1) {
    try {
      await MarketingContent.create({
        user: req.user?._id || null,
        product: result.ragContext?.groundedProduct?.id || null,
        prompt,
        caption: result.caption,
        platform,
        status: 'draft',
        metadata: {
          provider: result.provider,
          ragContext: result.ragContext
        }
      });
    } catch (err) {
      logger.debug('Could not save RAG draft record:', err.message);
    }
  }

  return successResponse(res, {
    statusCode: 200,
    caption: result.caption,
    posts: [
      {
        caption: result.caption,
        platform: result.platform || 'Facebook'
      }
    ],
    ragContext: result.ragContext,
    provider: result.provider
  });
});

// Generate multiple creative variations
exports.generateVariations = asyncHandler(async (req, res) => {
  const { prompt, count = 3 } = req.body;
  const variations = await aiService.generateVariations({ prompt, count });

  return successResponse(res, {
    statusCode: 200,
    variations
  });
});

// Backward-compatible publish endpoint for legacy /api/ai/publish
exports.publishToSocialMedia = asyncHandler(async (req, res) => {
  const { caption, imageUrl = null, platform = 'Facebook' } = req.body;

  const publishResult = await facebookService.publishPost({
    caption,
    imageUrl
  });

  // Save successful publication record
  try {
    await MarketingContent.create({
      user: req.user?._id || null,
      caption,
      imageUrl,
      platform,
      status: 'published',
      facebookPostId: publishResult.postId,
      publishedAt: new Date()
    });
  } catch (dbErr) {
    logger.debug('Failed to record published content in DB:', dbErr.message);
  }

  // Returns identical response shape expected by existing frontend
  return res.status(200).json({
    success: true,
    message: publishResult.message,
    data: publishResult.data,
    postId: publishResult.postId
  });
});
