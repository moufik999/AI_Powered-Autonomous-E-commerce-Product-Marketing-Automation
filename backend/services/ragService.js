/**
 * OmniMarket AI - RAG Service (Retrieval-Augmented Generation)
 * Retrieves relevant product data from MongoDB Atlas and augments AI prompts
 * for hyper-targeted, factually grounded e-commerce marketing generation.
 */

const Product = require('../models/Product');
const aiService = require('./aiService');
const logger = require('../utils/logger');

class RagService {
  /**
   * Search MongoDB for products matching user prompt or keywords
   * @param {string} query - Search query or prompt
   * @param {number} [limit=3] - Maximum products to retrieve
   * @returns {Promise<Array>} List of matched products
   */
  async retrieveRelevantProducts(query, limit = 3) {
    if (!query || !query.trim()) return [];

    const cleanQuery = query.trim();
    let matchedProducts = [];

    try {
      // 1. Try MongoDB Text Index Search
      matchedProducts = await Product.find(
        { $text: { $search: cleanQuery } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();
    } catch (err) {
      logger.debug('Text index search fallback to regex query:', err.message);
    }

    // 2. If text search returned no items, use regex keyword matching
    if (!matchedProducts || matchedProducts.length === 0) {
      try {
        const terms = cleanQuery
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(t => t.length > 2);

        if (terms.length > 0) {
          const regexPatterns = terms.map(term => new RegExp(term, 'i'));
          matchedProducts = await Product.find({
            $or: [
              { title: { $in: regexPatterns } },
              { tags: { $in: regexPatterns } },
              { category: { $in: regexPatterns } },
              { description: { $in: regexPatterns } }
            ]
          })
            .limit(limit)
            .lean();
        }
      } catch (regexErr) {
        logger.warn('Regex product search error:', regexErr.message);
      }
    }

    // 3. Fallback: If still empty, return featured or recent products as general context
    if (!matchedProducts || matchedProducts.length === 0) {
      try {
        matchedProducts = await Product.find({})
          .sort({ isFeatured: -1, createdAt: -1 })
          .limit(limit)
          .lean();
      } catch (allErr) {
        logger.warn('Could not retrieve fallback products:', allErr.message);
      }
    }

    return matchedProducts || [];
  }

  /**
   * Execute full RAG pipeline: Retrieve relevant product catalog data,
   * augment prompt with grounding context, and generate marketing copy.
   * @param {Object} params
   * @param {string} params.prompt - Merchant request
   * @param {string} [params.productId] - Optional specific product ID to focus on
   * @param {string} [params.platform='Facebook']
   * @param {string} [params.tone]
   */
  async generateWithRAG({ prompt, productId = null, platform = 'Facebook', tone = 'Engaging & High-Converting' }) {
    let retrievedProducts = [];
    let focusedProduct = null;

    if (productId) {
      try {
        focusedProduct = await Product.findById(productId).lean();
        if (focusedProduct) {
          retrievedProducts = [focusedProduct];
        }
      } catch (err) {
        logger.warn(`Could not find product by ID ${productId}:`, err.message);
      }
    }

    if (retrievedProducts.length === 0) {
      retrievedProducts = await this.retrieveRelevantProducts(prompt, 2);
      if (retrievedProducts.length > 0) {
        focusedProduct = retrievedProducts[0];
      }
    }

    // Build structured RAG context
    const ragContext = {
      matchedProductsCount: retrievedProducts.length,
      products: retrievedProducts.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        currency: p.currency || 'BDT',
        category: p.category,
        features: p.features || [],
        discountPercent: p.discountPercent || 0,
        stockStatus: p.stock > 0 ? 'In Stock' : 'Pre-order'
      }))
    };

    logger.info(`RAG Pipeline retrieved ${retrievedProducts.length} product(s) for query: "${prompt}"`);

    // Call AI Generation with Augmented Context
    const aiResult = await aiService.generateMarketingPost({
      prompt,
      platform,
      tone,
      ragContext
    });

    return {
      success: true,
      caption: aiResult.caption,
      platform,
      provider: aiResult.provider,
      ragContext: {
        isGrounded: retrievedProducts.length > 0,
        groundedProduct: focusedProduct
          ? {
              id: focusedProduct._id,
              title: focusedProduct.title,
              price: focusedProduct.price,
              currency: focusedProduct.currency || 'BDT',
              imageUrl: focusedProduct.imageUrl
            }
          : null,
        sourcesCount: retrievedProducts.length
      }
    };
  }
}

module.exports = new RagService();
