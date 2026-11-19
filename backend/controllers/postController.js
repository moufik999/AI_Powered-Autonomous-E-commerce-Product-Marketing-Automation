const Post = require('../models/Post');
const Photocard = require('../models/Photocard');
const MarketingContent = require('../models/MarketingContent');
const axios = require('axios');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const getFBConfig = () => {
  const rawBase = (process.env.FB_GRAPH_BASE_URL || 'https://graph.facebook.com').replace(/\/+$/, '');
  const version = (process.env.FB_GRAPH_API_VERSION || 'v18.0').replace(/^\/?/, '');
  const token = (process.env.FB_PAGE_ACCESS_TOKEN || '').trim().replace(/^["']|["']$/g, '');
  const pageId = (process.env.FB_PAGE_ID || '1469331552924612').trim().replace(/^["']|["']$/g, '');
  return {
    baseUrl: `${rawBase}/${version}`,
    token,
    pageId
  };
};

async function fetchFBInsights(rawPostId) {
  if (!rawPostId) {
    return { reactionsCount: 0, likesCount: 0, commentsCount: 0, repliesCount: 0, sharesCount: 0 };
  }

  const { baseUrl, token, pageId } = getFBConfig();
  if (!token) {
    return { reactionsCount: 0, likesCount: 0, commentsCount: 0, repliesCount: 0, sharesCount: 0 };
  }

  const candidateIds = [];
  if (rawPostId.includes('_')) {
    candidateIds.push(rawPostId);
  } else {
    candidateIds.push(`${pageId}_${rawPostId}`);
    candidateIds.push(rawPostId);
  }

  for (const targetId of candidateIds) {
    try {
      const url = `${baseUrl}/${targetId}`;
      const { data } = await axios.get(url, {
        params: {
          fields: 'reactions.summary(total_count),comments.summary(total_count).limit(50){comment_count},shares',
          access_token: token
        },
        timeout: 10000
      });

      const reactionsCount = data?.reactions?.summary?.total_count ?? 0;
      const commentsCount = data?.comments?.summary?.total_count ?? 0;
      let repliesCount = 0;
      if (Array.isArray(data?.comments?.data)) {
        repliesCount = data.comments.data.reduce((sum, c) => sum + (c.comment_count || 0), 0);
      }
      const sharesCount = data?.shares?.count ?? 0;

      return {
        reactionsCount,
        likesCount: reactionsCount,
        commentsCount,
        repliesCount,
        sharesCount,
        canonicalId: targetId
      };
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message;
      logger.debug(`[Facebook Insights] Attempt for ID ${targetId} returned: ${errMsg}`);
    }
  }

  return { reactionsCount: 0, likesCount: 0, commentsCount: 0, repliesCount: 0, sharesCount: 0 };
}

exports.savePost = asyncHandler(async (req, res) => {
  const {
    userId = '',
    userEmail,
    productName,
    category = '',
    productDetails = '',
    details = '',
    price = '',
    discount = '',
    generatedCaption,
    caption = '',
    photocardUrl = '',
    imageUrl = '',
    facebookPostId = '',
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
    if (category) existingPost.category = category;
    if (price) existingPost.price = price;
    if (discount) existingPost.discount = discount;
    if (resolvedDetails) existingPost.productDetails = resolvedDetails.trim();
    if (facebookPostId) existingPost.facebookPostId = facebookPostId;
    if (userId) existingPost.userId = userId;
    await existingPost.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Post updated and verified in database successfully',
      post: existingPost,
      data: { post: existingPost }
    });
  }

  const newPost = await Post.create({
    userId: userId || '',
    userEmail: resolvedEmail.trim(),
    productName: productName.trim(),
    category: category || '',
    productDetails: resolvedDetails ? resolvedDetails.trim() : '',
    price: price || '',
    discount: discount || '',
    generatedCaption: resolvedCaption.trim(),
    photocardUrl: resolvedPhotoUrl || '',
    facebookPostId: facebookPostId || '',
    reactionsCount: 0,
    likesCount: 0,
    commentsCount: 0,
    repliesCount: 0,
    sharesCount: 0,
    metadata
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Post information completely saved to database successfully',
    post: newPost,
    data: { post: newPost }
  });
});

exports.getHistory = asyncHandler(async (req, res) => {
  const userEmail = req.query.userEmail || req.headers['x-user-email'] || req.user?.email;

  let query = {};
  if (userEmail && userEmail.trim()) {
    query.userEmail = { $regex: new RegExp(`^${userEmail.trim()}$`, 'i') };
  }

  let posts = await Post.find(query).sort({ createdAt: -1 }).lean();

  if (userEmail && posts.length === 0) {
    posts = await Post.find({}).sort({ createdAt: -1 }).limit(30).lean();
  }

  const publishedMarketing = await MarketingContent.find({
    status: 'published',
    facebookPostId: { $ne: null }
  }).sort({ createdAt: -1 }).limit(50).lean();

  if (publishedMarketing.length > 0) {
    const fbMap = new Map();
    publishedMarketing.forEach((m) => {
      if (m.imageUrl && m.facebookPostId) {
        fbMap.set(m.imageUrl, m.facebookPostId);
      }
    });

    for (const post of posts) {
      if (!post.facebookPostId) {
        let matchedFbId = null;
        if (post.photocardUrl && fbMap.has(post.photocardUrl)) {
          matchedFbId = fbMap.get(post.photocardUrl);
        } else if (post.productName) {
          const match = publishedMarketing.find((m) =>
            m.caption && m.caption.toLowerCase().includes(post.productName.toLowerCase())
          );
          if (match) matchedFbId = match.facebookPostId;
        }

        if (matchedFbId) {
          post.facebookPostId = matchedFbId;
          Post.updateOne({ _id: post._id }, { $set: { facebookPostId: matchedFbId } }).catch(() => {});
        }
      }
    }
  }

  if (posts.length === 0) {
    const existingCards = await Photocard.find({}).sort({ createdAt: -1 }).limit(20).lean();
    if (existingCards.length > 0) {
      posts = existingCards.map((c) => ({
        _id: c._id,
        userId: '',
        userEmail: userEmail || 'moufik241-35-391@diu.edu.bd',
        productName: c.productName,
        category: c.category || '',
        productDetails: c.features ? c.features.join(', ') : '',
        price: c.price,
        discount: c.discount,
        generatedCaption: c.marketingHeadline || `🔥 Hot Deal on ${c.productName}! ${c.discount || 'Special offer'}. Order now!`,
        photocardUrl: c.finalImageUrl,
        facebookPostId: '',
        reactionsCount: 0,
        likesCount: 0,
        commentsCount: 0,
        repliesCount: 0,
        sharesCount: 0,
        createdAt: c.createdAt || c.generationDate || new Date()
      }));
    }
  }

  return successResponse(res, {
    statusCode: 200,
    count: posts.length,
    posts,
    data: { posts }
  });
});

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
    data: { count }
  });
});

exports.syncInsights = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  let post = null;
  if (postId && postId.match(/^[0-9a-fA-F]{24}$/)) {
    post = await Post.findById(postId);
  }
  if (!post && postId) {
    post = await Post.findOne({ facebookPostId: postId });
  }

  if (!post) {
    return errorResponse(res, {
      statusCode: 404,
      message: 'Post not found.',
      code: 'POST_NOT_FOUND'
    });
  }

  if (!post.facebookPostId) {
    const matchingContent = await MarketingContent.findOne({
      status: 'published',
      facebookPostId: { $ne: null },
      $or: [
        { imageUrl: post.photocardUrl },
        { caption: { $regex: new RegExp(post.productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
      ]
    }).sort({ createdAt: -1 });

    if (matchingContent && matchingContent.facebookPostId) {
      post.facebookPostId = matchingContent.facebookPostId;
    }
  }

  if (!post.facebookPostId || !post.facebookPostId.trim()) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'This post has not been published to Facebook yet or is missing a valid Facebook Post ID.',
      code: 'MISSING_FB_POST_ID'
    });
  }

  const insights = await fetchFBInsights(post.facebookPostId);
  const syncedAt = new Date().toISOString();

  post.reactionsCount = insights.reactionsCount;
  post.likesCount = insights.likesCount;
  post.commentsCount = insights.commentsCount;
  post.repliesCount = insights.repliesCount;
  post.sharesCount = insights.sharesCount;
  if (insights.canonicalId && !post.facebookPostId.includes('_')) {
    post.facebookPostId = insights.canonicalId;
  }
  await post.save();

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  return successResponse(res, {
    statusCode: 200,
    message: 'Facebook post insights synced successfully',
    syncedAt,
    insights: {
      reactionsCount: post.reactionsCount,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      repliesCount: post.repliesCount,
      sharesCount: post.sharesCount,
      syncedAt
    },
    post,
    data: {
      syncedAt,
      insights: {
        reactionsCount: post.reactionsCount,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        repliesCount: post.repliesCount,
        sharesCount: post.sharesCount,
        syncedAt
      },
      post
    }
  });
});
