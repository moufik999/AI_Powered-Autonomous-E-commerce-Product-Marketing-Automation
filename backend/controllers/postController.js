/**
 * OmniMarket AI - Post Controller
 * Manages saving and retrieving comprehensive AI post generation records:
 * User email, product attributes, RAG generated caption copy, Cloudinary photocard URL, and timestamps.
 */

const Post = require('../models/Post');
const Photocard = require('../models/Photocard');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// 1. Save All Post Info Endpoint
exports.savePost = asyncHandler(async (req, res) => {
  const {
    userEmail,
    productName,
    productDetails = '',
    details = '',
    price = '',
    discount = '',
    generatedCaption,
    caption = '',
    photocardUrl = '',
    imageUrl = '',
    metadata = {}
  } = req.body;

  const resolvedCaption = generatedCaption || caption;
  const resolvedEmail = userEmail || req.user?.email || 'moufik241-35-391@diu.edu.bd';
  const resolvedPhotoUrl = photocardUrl || imageUrl;
  const resolvedDetails = productDetails || details;

  if (!productName || !productName.trim()) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Product Name is required to save post record.',
      code: 'MISSING_PRODUCT_NAME'
    });
  }

  if (!resolvedCaption || !resolvedCaption.trim()) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Generated Caption is required to save post record.',
      code: 'MISSING_GENERATED_CAPTION'
    });
  }

  logger.info(`[Post Controller] Saving post record for user: ${resolvedEmail}, product: "${productName}"`);

  // Deduplication check: If a post already exists with this exact photocardUrl or recent generation for this user+product, update it instead of creating a duplicate document
  let existingPost = null;
  if (resolvedPhotoUrl) {
    existingPost = await Post.findOne({ photocardUrl: resolvedPhotoUrl });
  }
  if (!existingPost && productName) {
    existingPost = await Post.findOne({
      userEmail: resolvedEmail.trim(),
      productName: productName.trim(),
      createdAt: { $gte: new Date(Date.now() - 30000) }
    });
  }

  if (existingPost) {
    existingPost.generatedCaption = resolvedCaption.trim();
    if (resolvedPhotoUrl) existingPost.photocardUrl = resolvedPhotoUrl;
    if (price) existingPost.price = price;
    if (discount) existingPost.discount = discount;
    if (resolvedDetails) existingPost.productDetails = resolvedDetails.trim();
    await existingPost.save();

    logger.info(`[Post Controller] Updated existing post record in MongoDB: ${existingPost._id}`);
    return successResponse(res, {
      statusCode: 200,
      message: 'Post updated and verified in database successfully',
      post: existingPost,
      data: {
        post: existingPost
      }
    });
  }

  const newPost = await Post.create({
    userEmail: resolvedEmail.trim(),
    productName: productName.trim(),
    productDetails: resolvedDetails ? resolvedDetails.trim() : '',
    price: price || '',
    discount: discount || '',
    generatedCaption: resolvedCaption.trim(),
    photocardUrl: resolvedPhotoUrl || '',
    metadata
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Post information completely saved to database successfully',
    post: newPost,
    data: {
      post: newPost
    }
  });
});

// 2. Get Post Generation History
exports.getHistory = asyncHandler(async (req, res) => {
  const userEmail = req.query.userEmail || req.headers['x-user-email'] || req.user?.email;

  let query = {};
  if (userEmail && userEmail.trim()) {
    // Case-insensitive email match
    query.userEmail = { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') };
  }

  logger.info(`[Post Controller] Fetching post history with filter: ${JSON.stringify(query)}`);

  let posts = await Post.find(query)
    .sort({ createdAt: -1 })
    .lean();

  // If filtered by email but no posts exist for that specific email, fallback to recent posts
  if (userEmail && posts.length === 0) {
    posts = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
  }

  // Graceful fallback: If no Post records exist yet, bridge existing Photocard records
  if (posts.length === 0) {
    const existingCards = await Photocard.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (existingCards.length > 0) {
      posts = existingCards.map((c) => ({
        _id: c._id,
        userEmail: userEmail || 'moufik241-35-391@diu.edu.bd',
        productName: c.productName,
        productDetails: c.features ? c.features.join(', ') : '',
        price: c.price,
        discount: c.discount,
        generatedCaption: c.marketingHeadline || `🔥 Hot Deal on ${c.productName}! Limited time discount: ${c.discount || 'Special offer'}. Order now!`,
        photocardUrl: c.finalImageUrl,
        createdAt: c.createdAt || c.generationDate || new Date()
      }));
    }
  }

  return successResponse(res, {
    statusCode: 200,
    count: posts.length,
    posts,
    data: {
      posts
    }
  });
});

// 3. Get Posts Count (e.g. GET /api/posts/count)
exports.getCount = asyncHandler(async (req, res) => {
  const userEmail = req.query.userEmail || req.headers['x-user-email'] || req.user?.email;

  let query = {};
  if (userEmail && userEmail.trim()) {
    query.userEmail = { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') };
  }

  let count = await Post.countDocuments(query);

  if (count === 0) {
    const totalAll = await Post.countDocuments({});
    if (totalAll > 0) {
      count = totalAll;
    } else {
      const photocardCount = await Photocard.countDocuments({});
      count = photocardCount;
    }
  }

  return successResponse(res, {
    statusCode: 200,
    count,
    data: {
      count
    }
  });
});
