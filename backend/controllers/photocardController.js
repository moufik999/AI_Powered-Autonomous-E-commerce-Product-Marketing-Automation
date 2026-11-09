/**
 * OmniMarket AI - Photocard Controller
 * Orchestrates complete AI-Powered Dynamic Product Marketing Photocard workflow:
 * Gemini Analysis -> Template Selection -> OpenAI Background -> Sharp Compositing -> Cloudinary Storage.
 */

const geminiAnalysisService = require('../services/geminiAnalysisService');
const templateService = require('../services/templateService');
const imageGenService = require('../services/imageGenService');
const sharpCompositorService = require('../services/sharpCompositorService');
const cloudinaryService = require('../services/cloudinaryService');
const Photocard = require('../models/Photocard');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Generate Complete AI Photocard
exports.generatePhotocard = asyncHandler(async (req, res) => {
  const {
    productName,
    category = '',
    price = '',
    discount = '',
    details = '',
    productCutout = null,
    templateId = null,
    forceRegenerateBackground = false,
    storeName = 'Amar bazar'
  } = req.body;

  if (!productName || !productName.trim()) {
    return errorResponse(res, {
      statusCode: 400,
      message: 'Product Name is required to generate a photocard.',
      code: 'MISSING_PRODUCT_NAME'
    });
  }

  logger.info(`[Photocard Workflow] 1. Analyzing product: "${productName}" with Gemini...`);

  // Step 1: Gemini Product Analysis & Category Detection
  const analysis = await geminiAnalysisService.analyzeProduct({
    productName: productName.trim(),
    category: category.trim(),
    details: details.trim(),
    price: price.trim(),
    discount: discount.trim()
  });

  const detectedCategory = analysis.standardCategory || category || 'General';

  // Step 2: Dynamic Template Selection
  logger.info(`[Photocard Workflow] 2. Selecting template for category: "${detectedCategory}"...`);
  const template = await templateService.getTemplateForCategory(detectedCategory, templateId);

  // Step 3: AI Background Generation (OpenAI / Procedural with Caching)
  logger.info(`[Photocard Workflow] 3. Obtaining background image for template: "${template.templateName}"...`);
  const backgroundResult = await imageGenService.getOrGenerateBackground({
    category: detectedCategory,
    backgroundPrompt: analysis.backgroundPrompt || template.promptKeyword,
    templateId: template.templateId,
    forceRegenerate: forceRegenerateBackground
  });

  // Calculate Offer Price if price and discount exist
  let calculatedOfferPrice = '';
  if (price && discount) {
    const numPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
    const unit = price.replace(/[0-9.,]/g, '').trim() || 'BDT';
    const percentMatch = discount.match(/([0-9]+)\s*%/);
    if (numPrice && percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      calculatedOfferPrice = `${Math.round(numPrice * (1 - pct / 100)).toLocaleString()} ${unit}`;
    } else if (numPrice) {
      const fixMatch = discount.match(/([0-9]+)/);
      if (fixMatch) {
        const fix = parseFloat(fixMatch[1]);
        calculatedOfferPrice = `${Math.max(0, numPrice - fix).toLocaleString()} ${unit}`;
      }
    }
  }

  // Step 4: Sharp Image Composition (Combining Background, Cutout, Typography, Badges, CTA)
  logger.info(`[Photocard Workflow] 4. Compositing layers with Sharp...`);
  const composedBuffer = await sharpCompositorService.composite({
    backgroundBuffer: backgroundResult.buffer,
    productCutout,
    productData: {
      productName: productName.trim(),
      category: detectedCategory,
      marketingHeadline: analysis.marketingHeadline,
      features: analysis.features || [],
      price: price.trim(),
      discount: discount.trim(),
      offerPrice: calculatedOfferPrice
    },
    template,
    storeName
  });

  // Step 5: Upload Photocard and Background to Cloudinary in parallel
  logger.info(`[Photocard Workflow] 5. Uploading photocard & background to Cloudinary / CDN...`);
  const [uploadResult, bgUploadResult] = await Promise.all([
    cloudinaryService.uploadImage(composedBuffer, {
      folder: `omnimarket_photocards/${detectedCategory.toLowerCase()}`,
      publicId: `${detectedCategory.toLowerCase()}_${Date.now()}`
    }),
    cloudinaryService.uploadImage(backgroundResult.buffer, {
      folder: `omnimarket_backgrounds/${detectedCategory.toLowerCase()}`
    })
  ]);

  // Step 6: Save Metadata in MongoDB Photocard Collection
  let photocardRecord = null;
  try {
    photocardRecord = await Photocard.create({
      productName: productName.trim(),
      category: detectedCategory,
      templateId: template.templateId,
      templateName: template.templateName,
      marketingHeadline: analysis.marketingHeadline,
      features: analysis.features || [],
      price: price.trim(),
      discount: discount.trim(),
      offerPrice: calculatedOfferPrice,
      backgroundImage: bgUploadResult.secureUrl,
      finalImageUrl: uploadResult.secureUrl,
      cloudinaryPublicId: uploadResult.publicId,
      generationStatus: 'completed',
      metadata: {
        analysis,
        backgroundSource: backgroundResult.source,
        templateUsed: template.templateName
      }
    });
    logger.info(`✓ Photocard record saved to MongoDB: ${photocardRecord._id}`);
  } catch (dbErr) {
    logger.warn('Failed to save Photocard record in MongoDB:', dbErr.message);
  }

  const photocardPayload = {
    id: photocardRecord?._id || `gen_${Date.now()}`,
    finalImageUrl: uploadResult.secureUrl,
    backgroundImage: bgUploadResult.secureUrl,
    template: {
      templateId: template.templateId,
      templateName: template.templateName,
      category: template.category,
      backgroundStyle: template.backgroundStyle,
      colorScheme: template.colorScheme
    },
    analysis: {
      marketingHeadline: analysis.marketingHeadline,
      shortDescription: analysis.shortDescription,
      features: analysis.features,
      marketingStyle: analysis.marketingStyle,
      targetAudience: analysis.targetAudience
    },
    pricing: {
      price,
      discount,
      offerPrice: calculatedOfferPrice
    },
    backgroundSource: backgroundResult.source
  };

  // Step 7: Return Complete Payload (both photocard and data.photocard for maximum frontend compatibility)
  return successResponse(res, {
    statusCode: 200,
    message: 'AI Photocard generated successfully',
    data: {
      photocard: photocardPayload
    },
    photocard: photocardPayload
  });
});

// Regenerate AI Background Only and Re-composite
exports.regenerateBackground = asyncHandler(async (req, res) => {
  req.body.forceRegenerateBackground = true;
  return exports.generatePhotocard(req, res);
});

// Get Templates (All or by Category)
exports.getTemplates = asyncHandler(async (req, res) => {
  const { category } = req.query;
  let templates;

  if (category) {
    templates = await templateService.getTemplatesByCategory(category);
  } else {
    templates = await templateService.getAllTemplates();
  }

  return successResponse(res, {
    statusCode: 200,
    count: templates.length,
    templates,
    data: {
      templates
    }
  });
});

// Get Photocard Generation History
exports.getHistory = asyncHandler(async (req, res) => {
  const history = await Photocard.find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return successResponse(res, {
    statusCode: 200,
    count: history.length,
    history
  });
});
