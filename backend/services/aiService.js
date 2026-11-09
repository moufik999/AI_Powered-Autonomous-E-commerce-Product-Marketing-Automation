/**
 * OmniMarket AI - AI Generation Service
 * Powered by Google Gemini (@google/genai SDK) with resilient dynamic template generation.
 * Generates posts strictly from user inputs (Product Name, Category, Price, Discount, Details).
 */

require('dotenv').config();
const aiConfig = require('../config/ai');
const logger = require('../utils/logger');

class AiService {
  /**
   * Helper to parse and calculate prices and discounts
   */
  _computePricing(priceInput, discountInput) {
    if (!priceInput && !discountInput) return null;

    const cleanPrice = (priceInput || '').trim();
    const cleanDiscount = (discountInput || '').trim();

    // Try to extract numeric price and currency
    const priceNumMatch = cleanPrice.match(/([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
    const unitMatch = cleanPrice.replace(/[0-9.,]/g, '').trim() || 'BDT';

    if (priceNumMatch) {
      const rawNum = parseFloat(priceNumMatch[1].replace(/,/g, ''));
      
      // If discount is given
      if (cleanDiscount) {
        // Percentage discount e.g. "10%" or "10"
        const percentMatch = cleanDiscount.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
        if (percentMatch) {
          const percent = parseFloat(percentMatch[1]);
          const offerPrice = Math.round(rawNum * (1 - percent / 100));
          return {
            hasOffer: true,
            originalPrice: `${rawNum.toLocaleString()} ${unitMatch}`,
            offerPrice: `${offerPrice.toLocaleString()} ${unitMatch}`,
            discountText: `${percent}% OFF`
          };
        }

        // Fixed amount discount e.g. "200 BDT OFF" or "200"
        const fixedMatch = cleanDiscount.match(/([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/);
        if (fixedMatch) {
          const discountAmt = parseFloat(fixedMatch[1].replace(/,/g, ''));
          const offerPrice = Math.max(0, rawNum - discountAmt);
          return {
            hasOffer: true,
            originalPrice: `${rawNum.toLocaleString()} ${unitMatch}`,
            offerPrice: `${offerPrice.toLocaleString()} ${unitMatch}`,
            discountText: `${discountAmt.toLocaleString()} ${unitMatch} OFF`
          };
        }

        // Fallback with custom discount string
        return {
          hasOffer: true,
          originalPrice: cleanPrice,
          offerPrice: null,
          discountText: cleanDiscount
        };
      }

      // Price only
      return {
        hasOffer: false,
        price: `${rawNum.toLocaleString()} ${unitMatch}`
      };
    }

    // Textual price without clean numbers
    if (cleanPrice && cleanDiscount) {
      return {
        hasOffer: true,
        originalPrice: cleanPrice,
        discountText: cleanDiscount
      };
    }

    if (cleanPrice) {
      return {
        hasOffer: false,
        price: cleanPrice
      };
    }

    if (cleanDiscount) {
      return {
        hasOffer: true,
        discountText: cleanDiscount
      };
    }

    return null;
  }

  /**
   * Predict category-specific features, emojis, and hashtags
   */
  _predictCategoryDetails(productName, category, details) {
    const catLower = (category || '').toLowerCase();
    const prodLower = (productName || '').toLowerCase();
    const cleanTag = productName.replace(/[^\w]/g, '');

    // 1. Food / Fruits / Grocery
    if (catLower.includes('food') || catLower.includes('fruit') || catLower.includes('grocery') || prodLower.includes('mango') || prodLower.includes('rice') || prodLower.includes('oil')) {
      return {
        emojis: ['🥭', '🌿', '🍃', '🧺', '✨', '🌟'],
        hook: `Craving the pure, farm-fresh taste of premium ${productName}? 🌿`,
        highlights: [
          '100% Naturally Grown & Hand-Picked',
          'Rich in Natural Flavor, Sweetness & Aroma',
          'Zero Harmful Chemicals or Artificial Preservatives',
          'Hygienically Sorted & Packaged for Guaranteed Freshness'
        ],
        cta: `Order your fresh batch of ${productName} today from Amar bazar and savor the natural goodness! 🛒✨`,
        hashtags: [`#Fresh${cleanTag}`, `#OrganicFood`, `#FarmFresh`, `#AmarBazar`, `#HealthyLiving`]
      };
    }

    // 2. Electronics / Gadgets / Audio
    if (catLower.includes('electron') || catLower.includes('gadget') || catLower.includes('tech') || catLower.includes('audio') || prodLower.includes('earbud') || prodLower.includes('watch') || prodLower.includes('phone')) {
      return {
        emojis: ['⚡', '🎧', '🔋', '🚀', '💎', '✨'],
        hook: `Take your everyday tech performance to the next level with ${productName}! ⚡`,
        highlights: [
          'Next-Gen Performance & Precision Engineering',
          'Ergonomic Design with Modern Aesthetic Finish',
          'Fast, Reliable & Long-Lasting Battery Efficiency',
          'Seamless Compatibility & Crystal Clear Audio/Display'
        ],
        cta: `Upgrade your setup now! Tap to order ${productName} from Amar bazar before stock runs out! 🚀`,
        hashtags: [`#${cleanTag}`, `#TechTrends`, `#Electronics`, `#AmarBazar`, `#SmartGadgets`]
      };
    }

    // 3. Fashion / Clothing / Apparel / Accessories
    if (catLower.includes('fashion') || catLower.includes('cloth') || catLower.includes('apparel') || catLower.includes('wear') || prodLower.includes('shirt') || prodLower.includes('dress') || prodLower.includes('pant')) {
      return {
        emojis: ['✨', '👗', '👔', '🕶️', '💫', '🔥'],
        hook: `Step out in effortless style with the brand new ${productName}! ✨`,
        highlights: [
          'Premium Comfort Fabric Designed for All-Day Wear',
          'Tailored Fit with Modern Contemporary Silhouette',
          'Long-Lasting Color Fastness & Superior Stitching',
          'Versatile Styling – Perfect for Casual & Formal Outings'
        ],
        cta: `Refresh your wardrobe today! Grab your ${productName} now from Amar bazar! 🛍️`,
        hashtags: [`#FashionStyle`, `#OOTD`, `#${cleanTag}`, `#AmarBazar`, `#TrendingNow`]
      };
    }

    // 4. Beauty / Cosmetics / Skincare
    if (catLower.includes('beauty') || catLower.includes('cosmetic') || catLower.includes('skin') || catLower.includes('care')) {
      return {
        emojis: ['🌸', '✨', '💧', '🌿', '💖', '💫'],
        hook: `Unlock your natural glow and radiant skin with ${productName}! 🌸`,
        highlights: [
          'Gentle & Nourishing Formula Suitable for All Skin Types',
          'Infused with Hydrating & Skin-Loving Active Ingredients',
          'Dermatologist Tested for Safe Everyday Use',
          'Leaves Your Skin Feeling Soft, Refreshed & Rejuvenated'
        ],
        cta: `Give your skin the pampering it deserves! Order ${productName} from Amar bazar today! 💖`,
        hashtags: [`#SkincareRoutine`, `#BeautyEssentials`, `#GlowUp`, `#AmarBazar`, `#${cleanTag}`]
      };
    }

    // 5. Default / Other E-commerce Categories
    return {
      emojis: ['🔥', '✨', '🌟', '🚀', '📦', '🎯'],
      hook: `Discover unmatched quality and value with ${productName}! 🔥`,
      highlights: [
        'Top-Tier Quality Built with Premium Materials',
        'Engineered for Long-Lasting Durability & Everyday Utility',
        'Smart, Functional & Easy to Use',
        'Customer Favorite with Guaranteed Satisfaction'
      ],
      cta: `Don't miss out! Order your ${productName} from Amar bazar today! 🛒✨`,
      hashtags: [`#${cleanTag}`, `#BestQuality`, `#AmarBazar`, `#OnlineShopping`, `#TrendingDeals`]
    };
  }

  /**
   * Generate an e-commerce marketing post based on structured product inputs
   * @param {Object} options
   * @param {string} options.productName - Product name (required)
   * @param {string} options.category - Product category (required)
   * @param {string} [options.price] - Product price (optional)
   * @param {string} [options.discount] - Discount details (optional)
   * @param {string} [options.details] - Custom prompt/features/instructions (optional)
   * @param {string} [options.prompt] - Fallback prompt if sent as single string
   * @param {string} [options.platform='Facebook'] - Target social platform
   * @param {string} [options.storeName='Amar bazar'] - Store name
   * @returns {Promise<{success: boolean, caption: string, provider: string}>}
   */
  async generateMarketingPost({
    productName = '',
    category = '',
    price = '',
    discount = '',
    details = '',
    prompt = '',
    platform = 'Facebook',
    tone = 'Engaging & High-Converting',
    storeName = 'Amar bazar'
  }) {
    // Normalize inputs
    const finalProductName = (productName || prompt).trim();
    const finalCategory = (category || 'General').trim();
    const finalPrice = (price || '').trim();
    const finalDiscount = (discount || '').trim();
    const finalDetails = (details || (productName ? prompt : '')).trim();

    if (!finalProductName) {
      const error = new Error('Product Name is required to generate a marketing post.');
      error.statusCode = 400;
      throw error;
    }

    // Try Google Gemini AI if configured
    if (aiConfig.isAiConfigured() && aiConfig.genAIClient) {
      try {
        const generatedCaption = await this._generateWithGemini({
          productName: finalProductName,
          category: finalCategory,
          price: finalPrice,
          discount: finalDiscount,
          details: finalDetails,
          platform,
          tone,
          storeName
        });

        if (generatedCaption && generatedCaption.trim().length > 10) {
          return {
            success: true,
            caption: generatedCaption.trim(),
            platform,
            provider: 'Google Gemini AI',
            model: aiConfig.modelName
          };
        }
      } catch (geminiError) {
        logger.warn(`Gemini AI Generation failed (${geminiError.message}). Using dynamic algorithmic generator.`);
      }
    }

    // Fallback: Dynamic algorithmic generator tailored strictly to user inputs
    const fallbackCaption = this._generateDynamicPost({
      productName: finalProductName,
      category: finalCategory,
      price: finalPrice,
      discount: finalDiscount,
      details: finalDetails,
      storeName
    });

    return {
      success: true,
      caption: fallbackCaption,
      platform,
      provider: 'OmniMarket Dynamic Engine'
    };
  }

  /**
   * Internal method to call Google Gemini API using @google/genai SDK
   */
  async _generateWithGemini({
    productName,
    category,
    price,
    discount,
    details,
    platform,
    tone,
    storeName
  }) {
    const pricingInfo = price
      ? (discount ? `Price: ${price}, Discount: ${discount} (Calculate and display both regular and offer price)` : `Price: ${price}`)
      : (discount ? `Discount: ${discount} (No base price provided; do not invent a price)` : 'No price or discount provided. STRICT RULE: DO NOT INVENT OR MENTION ANY PRICE.');

    const promptText = `You are OmniMarket AI, an expert autonomous e-commerce social media marketing specialist.
Write a high-converting, viral, and engaging ${platform} promotional post for "${storeName}".

PRODUCT INPUTS:
- Product Name: ${productName}
- Product Category: ${category}
- Pricing & Discount: ${pricingInfo}
${details ? `- Additional Details/Instructions: ${details}` : ''}

STRICT GENERATION RULES:
1. Base the post strictly on the provided Product Name ("${productName}") and Category ("${category}").
2. PRICING RULE: Only include pricing if explicitly provided above. If price is omitted, NEVER invent or guess a price. If both Price and Discount are provided, calculate and display the deal clearly.
3. NO HARDCODED OR UNRELATED ITEMS: Do NOT mention smartwatches, leather wallets, or default catalog items unless the product is actually that item.
4. NO GENERIC BOILERPLATE: Do NOT include generic checklist blocks like "Why Choose Amar bazar?", "100% Authentic & Tested Quality", "Ultra-fast Express Delivery", or "Safe & Cash On Delivery Available".
5. DYNAMIC PREDICTION: Dynamically predict attractive product highlights, benefits, sensory hooks, and 3-5 relevant hashtags specifically tailored to ${productName} in the ${category} category.
6. Return ONLY the final ready-to-publish post caption without preamble or explanation.`;

    logger.info(`Sending dynamic prompt to Gemini model: ${aiConfig.modelName}`);

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini API call timed out after 4000ms')), 4000);
    });

    try {
      const response = await Promise.race([
        aiConfig.genAIClient.models.generateContent({
          model: aiConfig.modelName,
          contents: promptText,
          config: {
            temperature: aiConfig.temperature,
            maxOutputTokens: aiConfig.maxOutputTokens
          }
        }),
        timeoutPromise
      ]);

      if (response && response.text) {
        return response.text;
      }

      throw new Error('Empty response received from Gemini API');
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Dynamic post generator strictly without boilerplate or hardcoded catalog data
   */
  _generateDynamicPost({ productName, category, price, discount, details, storeName = 'Amar bazar' }) {
    const predicted = this._predictCategoryDetails(productName, category, details);
    const pricing = this._computePricing(price, discount);

    let priceSection = '';
    if (pricing) {
      if (pricing.hasOffer && pricing.offerPrice) {
        priceSection = `\n🏷️ Regular Price: ${pricing.originalPrice}\n💥 Special Offer: ${pricing.offerPrice} (${pricing.discountText}!)\n`;
      } else if (pricing.hasOffer && pricing.discountText) {
        priceSection = `\n💥 Special Deal: ${pricing.discountText}` + (pricing.originalPrice ? ` (Original: ${pricing.originalPrice})` : '') + '\n';
      } else if (pricing.price) {
        priceSection = `\n🏷️ Price: ${pricing.price}\n`;
      }
    }

    // Custom highlights if provided in details
    let highlightsToUse = predicted.highlights;
    if (details) {
      const userPoints = details
        .split(/[\n,;•]/)
        .map(p => p.trim())
        .filter(p => p.length > 3);
      if (userPoints.length > 0) {
        highlightsToUse = userPoints.slice(0, 4);
      }
    }

    const highlightsBlock = highlightsToUse.map(h => `✨ ${h}`).join('\n');

    const caption = `${predicted.hook}
${priceSection}
🌟 Product Highlights:
${highlightsBlock}

${predicted.cta}

${predicted.hashtags.join(' ')}`;

    return caption.trim();
  }

  /**
   * Generate multiple creative variations
   */
  async generateVariations({ productName, category, price, discount, details, storeName = 'Amar bazar', count = 3 }) {
    const base = await this.generateMarketingPost({ productName, category, price, discount, details, storeName });
    const pricing = this._computePricing(price, discount);
    const priceText = pricing ? (pricing.hasOffer ? ` Now only ${pricing.offerPrice || pricing.discountText}!` : ` at ${pricing.price}!`) : '';

    const variations = [
      {
        id: 1,
        style: 'High-Converting & Engaging',
        caption: base.caption
      },
      {
        id: 2,
        style: 'Urgent & Promotional Flash Deal',
        caption: `⚡ LIMITED TIME OFFER: ${productName} ⚡\n\nLooking for the best ${category}? Grab yours today${priceText}\n\n💥 Message us or order now from ${storeName} before stock runs out!\n\n#SpecialDeal #${productName.replace(/[^\w]/g, '')} #${storeName.replace(/\s+/g, '')} #ShopNow`
      },
      {
        id: 3,
        style: 'Minimalist & Direct',
        caption: `Upgrade your daily lifestyle with ${productName}. ✨\n\nAuthentic, verified, and delivered right to your doorstep.${priceText ? `\n\n🏷️ ${priceText.trim()}` : ''}\n\n🛒 Order now from ${storeName}!\n\n#MustHave #${category.replace(/[^\w]/g, '')} #${storeName.replace(/\s+/g, '')}`
      }
    ];

    return variations.slice(0, count);
  }
}

module.exports = new AiService();
