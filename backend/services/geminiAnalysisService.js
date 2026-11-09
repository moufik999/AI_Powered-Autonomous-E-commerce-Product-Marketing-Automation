/**
 * OmniMarket AI - Gemini Product Analysis Service
 * Uses Google Gemini API to analyze products, detect categories, extract key features,
 * determine color/marketing styles, and craft specialized background generation prompts.
 */

require('dotenv').config();
const aiConfig = require('../config/ai');
const logger = require('../utils/logger');

// Standard supported categories
const SUPPORTED_CATEGORIES = [
  'Gaming',
  'Electronics',
  'Skincare',
  'Fashion',
  'Food',
  'Sports',
  'Home Decor',
  'General'
];

class GeminiAnalysisService {
  /**
   * Deeply analyze product information using Gemini
   */
  async analyzeProduct({ productName, category = '', details = '', price = '', discount = '' }) {
    // Attempt analysis with Gemini if available
    if (aiConfig.isAiConfigured() && aiConfig.genAIClient) {
      try {
        const analysis = await this._analyzeWithGemini({ productName, category, details, price, discount });
        if (analysis && analysis.standardCategory) {
          logger.info(`✓ Gemini Product Analysis completed for "${productName}" (Category: ${analysis.standardCategory})`);
          return analysis;
        }
      } catch (err) {
        logger.warn(`Gemini analysis failed (${err.message}). Using intelligent algorithmic fallback.`);
      }
    }

    // Fallback: Intelligent heuristic classification and copy crafting
    return this._fallbackAnalysis({ productName, category, details, price, discount });
  }

  /**
   * Internal Gemini API caller with JSON output structuring
   */
  async _analyzeWithGemini({ productName, category, details, price, discount }) {
    const prompt = `You are OmniMarket AI Senior Product Strategist. Analyze this e-commerce product and output valid JSON only.

PRODUCT DETAILS:
- Name: ${productName}
- Input Category: ${category || 'Unknown'}
- Details: ${details || 'None provided'}
- Price: ${price || 'None provided'}
- Discount: ${discount || 'None provided'}

RULES:
1. Map "standardCategory" strictly to one of: ["Gaming", "Electronics", "Skincare", "Fashion", "Food", "Sports", "Home Decor", "General"].
2. Extract 3 concise features (max 5 words each).
3. Generate a punchy high-converting headline (3-6 words).
4. Craft an OpenAI DALL-E prompt for an EMPTY commercial advertising studio background stage tailored to this product. The stage must have clean central negative space for a product, NO people, and NEVER any fake product or text.

JSON FORMAT TO RETURN (RAW JSON ONLY, NO MARKDOWN BLOCK):
{
  "productName": "${productName}",
  "standardCategory": "one of the standard categories",
  "productType": "specific item type",
  "features": ["feature 1", "feature 2", "feature 3"],
  "productColors": ["primary color", "accent color"],
  "targetAudience": "brief audience description",
  "marketingStyle": "e.g. Cyberpunk RGB / Luxury Minimalist / Farm-Fresh Organic",
  "marketingHeadline": "Punchy Commercial Headline",
  "shortDescription": "One compelling sentence highlighting benefits",
  "backgroundPrompt": "Photorealistic 3D commercial advertising studio stage with..."
}`;

    // Run Gemini generation with strict 4-second timeout to prevent stalling
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Gemini API call timed out after 4000ms')), 4000);
    });

    try {
      const response = await Promise.race([
        aiConfig.genAIClient.models.generateContent({
          model: aiConfig.modelName,
          contents: prompt,
          config: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        }),
        timeoutPromise
      ]);

      const text = response?.text?.trim() || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Algorithmic fallback analysis for zero-downtime execution
   */
  _fallbackAnalysis({ productName, category = '', details = '', price = '', discount = '' }) {
    const pLower = (productName || '').toLowerCase();
    const cLower = (category || '').toLowerCase();

    let standardCategory = 'General';
    let marketingStyle = 'Modern Commercial';
    let headline = `Experience Premium ${productName}`;
    let features = ['Top-Tier Quality', 'Verified Durability', 'Guaranteed Satisfaction'];
    let backgroundPrompt = `Commercial product photography studio podium stage, neutral dramatic spotlight, clean negative space, 8k resolution, minimalist advertisement`;

    // 1. Gaming
    if (pLower.includes('gpu') || pLower.includes('rtx') || pLower.includes('gaming') || pLower.includes('rgb') || cLower.includes('game') || pLower.includes('keyboard')) {
      standardCategory = 'Gaming';
      marketingStyle = 'Cyberpunk RGB & Neon Energy';
      headline = 'Unleash Next-Level Power';
      features = ['Ultra High Frame Rates', 'Extreme Cooling System', 'Ray Tracing Performance'];
      backgroundPrompt = 'Futuristic high-tech gaming battle station background, dark metallic floor, glowing violet and electric cyan neon accents, volumetric smoke, illuminated hexagonal podium platform, empty center space for product display, photorealistic 8k commercial advertisement';
    }
    // 2. Skincare / Beauty
    else if (pLower.includes('cream') || pLower.includes('serum') || pLower.includes('skin') || cLower.includes('skin') || cLower.includes('beauty') || pLower.includes('lotion')) {
      standardCategory = 'Skincare';
      marketingStyle = 'Pure Minimalist & Botanical Luxury';
      headline = 'Glow with Pure Radiance';
      features = ['Dermatologist Tested', 'Deep Hydration Formula', 'Gentle on Sensitive Skin'];
      backgroundPrompt = 'Luxury beauty cosmetic studio background, soft pastel peach and warm cream tones, smooth organic beige marble pedestal, gentle morning sunbeams, soft water ripples, ethereal blurred botanical shadows, minimalist commercial product photography stage, empty center';
    }
    // 3. Sports / Running Shoes
    else if (pLower.includes('shoe') || pLower.includes('running') || pLower.includes('sneaker') || cLower.includes('sport') || pLower.includes('fitness')) {
      standardCategory = 'Sports';
      marketingStyle = 'Dynamic Athletic Performance';
      headline = 'Push Beyond Every Limit';
      features = ['Responsive Cushioning', 'Breathable Mesh Upper', 'High-Traction Grip'];
      backgroundPrompt = 'Dynamic athletic sports commercial stage, sleek modern dark concrete pedestal, striking diagonal speed neon light streaks, high-contrast energetic studio lighting, atmospheric haze, empty center platform for footwear, commercial 8k advertising shoot';
    }
    // 4. Electronics / Smartwatch
    else if (pLower.includes('watch') || pLower.includes('smartwatch') || pLower.includes('earbuds') || pLower.includes('phone') || cLower.includes('electron')) {
      standardCategory = 'Electronics';
      marketingStyle = 'Futuristic Precision Engineering';
      headline = 'Smarter Living on Your Wrist';
      features = ['Vibrant AMOLED Display', 'All-Day Battery Life', 'Real-Time Health Tracking'];
      backgroundPrompt = 'Sleek futuristic technology studio stage, polished dark obsidian glass platform, subtle circular blue LED halo illumination, soft volumetric overhead spotlight, deep navy backdrop, clean negative space for product placement, 8k commercial shoot';
    }
    // 5. Food & Coffee
    else if (pLower.includes('coffee') || pLower.includes('bean') || pLower.includes('tea') || pLower.includes('mango') || cLower.includes('food') || cLower.includes('fruit')) {
      standardCategory = 'Food';
      marketingStyle = 'Artisan Warmth & Natural Freshness';
      headline = 'Rich Aroma in Every Sip';
      features = ['100% Single-Origin Beans', 'Slow Roasted Perfection', 'Rich & Velvety Crema'];
      backgroundPrompt = 'Artisan cafe product photography stage, rustic dark reclaimed wood surface, warm golden morning window light, subtle soft coffee steam in blurred background, warm earthy tones, clean center space for product display, commercial food magazine style';
    }
    // 6. Fashion / Backpack
    else if (pLower.includes('backpack') || pLower.includes('bag') || pLower.includes('jacket') || cLower.includes('fashion') || pLower.includes('panjabi')) {
      standardCategory = 'Fashion';
      marketingStyle = 'Contemporary Urban Elegance';
      headline = 'Crafted for Daily Journeys';
      features = ['Water-Resistant Fabric', 'Ergonomic Weight Balance', 'Dedicated Laptop Sleeve'];
      backgroundPrompt = 'High-fashion urban minimalist studio stage, architectural textured concrete cube pedestal, warm directional spotlight casting soft geometry shadows, sophisticated neutral grey and sand backdrop, empty center for bag showcase, 8k luxury editorial advertising';
    }
    // 7. Home Decor
    else if (cLower.includes('home') || cLower.includes('decor') || pLower.includes('lamp') || pLower.includes('furniture')) {
      standardCategory = 'Home Decor';
      marketingStyle = 'Warm Scandinavian Architecture';
      headline = 'Transform Your Living Space';
      features = ['Handcrafted Aesthetic', 'Timeless Modern Design', 'Eco-Friendly Materials'];
      backgroundPrompt = 'Scandinavian interior design showroom background, warm light oak wooden pedestal, arched plaster alcove, soft golden hour sunlight, minimalist ceramic vase in background blur, clean empty central stage for home product, architectural digest style';
    }

    // Incorporate custom user details if provided
    if (details) {
      const customPoints = details
        .split(/[\n,;•]/)
        .map(p => p.trim())
        .filter(p => p.length > 3);
      if (customPoints.length > 0) {
        features = customPoints.slice(0, 3);
      }
    }

    return {
      productName,
      standardCategory,
      productType: standardCategory,
      features,
      productColors: ['#3b82f6', '#1d4ed8'],
      targetAudience: 'Modern online shoppers seeking verified quality',
      marketingStyle,
      marketingHeadline: headline,
      shortDescription: `Discover the unmatched craftsmanship and performance of ${productName}.`,
      backgroundPrompt
    };
  }
}

module.exports = new GeminiAnalysisService();
