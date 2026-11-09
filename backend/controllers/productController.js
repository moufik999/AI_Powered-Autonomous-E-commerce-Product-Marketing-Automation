/**
 * OmniMarket AI - Product Controller
 * Handles CRUD operations for product inventory and catalog used by RAG.
 */

const productService = require('../services/productService');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const { products, total } = await productService.getAllProducts({
    search,
    category,
    limit: parseInt(limit, 10),
    skip
  });

  return successResponse(res, {
    statusCode: 200,
    total,
    page: parseInt(page, 10),
    products
  });
});

// Get single product
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return errorResponse(res, {
      statusCode: 404,
      message: 'Product not found',
      code: 'PRODUCT_NOT_FOUND'
    });
  }

  return successResponse(res, {
    statusCode: 200,
    product
  });
});

// Create new product
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct({
    ...req.body,
    merchant: req.user?._id || null
  });

  return successResponse(res, {
    statusCode: 201,
    message: 'Product created successfully',
    product
  });
});

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);

  if (!product) {
    return errorResponse(res, {
      statusCode: 404,
      message: 'Product not found',
      code: 'PRODUCT_NOT_FOUND'
    });
  }

  return successResponse(res, {
    statusCode: 200,
    message: 'Product updated successfully',
    product
  });
});

// Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);

  if (!product) {
    return errorResponse(res, {
      statusCode: 404,
      message: 'Product not found',
      code: 'PRODUCT_NOT_FOUND'
    });
  }

  return successResponse(res, {
    statusCode: 200,
    message: 'Product deleted successfully'
  });
});

// Seed default products
exports.seedProducts = asyncHandler(async (req, res) => {
  await productService.seedDefaultProducts();
  const { products, total } = await productService.getAllProducts({ limit: 10 });

  return successResponse(res, {
    statusCode: 200,
    message: 'Products seeded successfully',
    total,
    products
  });
});
