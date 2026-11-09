/**
 * OmniMarket AI - AI Background Generation Service
 * Calls OpenAI Image Generation API (DALL-E) to create unique, category-tailored
 * commercial advertising stages with intelligent database and in-memory caching.
 * Features a high-res Sharp procedural studio generator as an offline/unconfigured fallback.
 */

require('dotenv').config();
const crypto = require('crypto');
const axios = require('axios');
const sharp = require('sharp');
const openaiConfig = require('../config/openai');
const logger = require('../utils/logger');

// In-memory cache for fast lookup and cost optimization
const backgroundMemoryCache = new Map();

class ImageGenService {
  /**
   * Generate or retrieve a cached commercial background for a product and template
   * @param {Object} params
   * @param {string} params.category - Product category
   * @param {string} params.backgroundPrompt - Customized prompt from Gemini or template
   * @param {string} params.templateId - Selected template ID
   * @param {boolean} [params.forceRegenerate=false] - If true, bypasses cache
   * @returns {Promise<{buffer: Buffer, source: string, promptUsed: string}>}
   */
  async getOrGenerateBackground({
    category = 'General',
    backgroundPrompt = '',
    templateId = 'general',
    forceRegenerate = false
  }) {
    const cacheKey = `${category}_${templateId}_${crypto.createHash('md5').update(backgroundPrompt).digest('hex').substring(0, 8)}`;

    if (!forceRegenerate && backgroundMemoryCache.has(cacheKey)) {
      logger.info(`✓ Reusing cached commercial background for category: "${category}" [CacheKey: ${cacheKey}]`);
      return {
        buffer: backgroundMemoryCache.get(cacheKey),
        source: 'cache',
        promptUsed: backgroundPrompt
      };
    }

    // Try OpenAI DALL-E Image Generation if configured
    if (openaiConfig.isOpenAiConfigured()) {
      try {
        const fullPrompt = `${backgroundPrompt}. Pure commercial advertising photography background, empty center platform for product placement, cinematic studio lighting, 8k resolution, ultra-detailed, photorealistic, no text, no words, no logos, no humans, no replacement products.`;
        logger.info(`Sending background generation prompt to OpenAI Image Generation API (${openaiConfig.imageModel})...`);

        const response = await openaiConfig.openaiClient.images.generate({
          model: openaiConfig.imageModel,
          prompt: fullPrompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json'
        });

        const b64Data = response.data[0]?.b64_json;
        if (b64Data) {
          const buffer = Buffer.from(b64Data, 'base64');
          backgroundMemoryCache.set(cacheKey, buffer);
          logger.info(`✓ Successfully generated AI background via OpenAI for category: "${category}"`);
          return {
            buffer,
            source: 'openai-dalle',
            promptUsed: fullPrompt
          };
        }
      } catch (err) {
        logger.warn(`OpenAI background generation failed (${err.message}). Using high-fidelity Sharp studio background generator.`);
      }
    }

    // Procedural Fallback: Generate custom high-resolution category-tailored studio background via Sharp
    const proceduralBuffer = await this._generateProceduralCategoryStudio(category, templateId);
    backgroundMemoryCache.set(cacheKey, proceduralBuffer);
    return {
      buffer: proceduralBuffer,
      source: 'procedural-studio',
      promptUsed: backgroundPrompt || `Procedural 3D studio stage for ${category}`
    };
  }

  /**
   * Generates a photorealistic category-tailored 1080x1080 studio background using Sharp and SVG vectors
   */
  async _generateProceduralCategoryStudio(category, templateId) {
    const W = 1080;
    const H = 1080;

    let bgGradDef = '';
    let spotlightDef = '';
    let podiumDef = '';

    const cat = (category || '').toLowerCase();

    // 1. Gaming
    if (cat.includes('game') || templateId.includes('gaming')) {
      bgGradDef = `
        <defs>
          <radialGradient id="gamingBg" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stop-color="#2e0854" />
            <stop offset="45%" stop-color="#110524" />
            <stop offset="85%" stop-color="#06020c" />
            <stop offset="100%" stop-color="#000000" />
          </radialGradient>
          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.2" />
          </linearGradient>
          <linearGradient id="neonViolet" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ec4899" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.1" />
          </linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#gamingBg)" />
        <!-- Cyber grid floor -->
        <g opacity="0.22" stroke="#06b6d4" stroke-width="1.2">
          ${Array.from({ length: 9 }).map((_, i) => `<line x1="0" y1="${740 + i * 40}" x2="${W}" y2="${740 + i * 40}" />`).join('')}
          ${Array.from({ length: 11 }).map((_, i) => `<line x1="${540 + (i - 5) * 85}" y1="740" x2="${540 + (i - 5) * 160}" y2="${H}" />`).join('')}
        </g>
      `;
      spotlightDef = `
        <polygon points="460,0 620,0 840,780 240,780" fill="url(#neonCyan)" opacity="0.18" />
        <circle cx="540" cy="740" r="280" fill="url(#neonViolet)" opacity="0.3" filter="blur(40px)" />
      `;
      podiumDef = `
        <!-- Gaming Hexagonal Podium Base -->
        <polygon points="320,830 760,830 840,890 240,890" fill="#090514" stroke="#8b5cf6" stroke-width="2.5" />
        <!-- Top Hexagonal Face -->
        <polygon points="360,780 720,780 790,830 290,830" fill="#130924" stroke="#06b6d4" stroke-width="3" />
        <ellipse cx="540" cy="805" rx="180" ry="32" fill="#000000" opacity="0.8" filter="blur(10px)" />
      `;
    }
    // 2. Skincare
    else if (cat.includes('skin') || cat.includes('beauty') || templateId.includes('skincare')) {
      bgGradDef = `
        <defs>
          <radialGradient id="skinBg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#fdf2f8" />
            <stop offset="40%" stop-color="#fce7f3" />
            <stop offset="80%" stop-color="#fbcfe8" />
            <stop offset="100%" stop-color="#f472b6" />
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#skinBg)" />
        <circle cx="540" cy="220" r="380" fill="#ffffff" opacity="0.45" filter="blur(50px)" />
      `;
      spotlightDef = `
        <ellipse cx="540" cy="520" rx="340" ry="180" fill="#ffffff" opacity="0.3" filter="blur(30px)" />
      `;
      podiumDef = `
        <!-- Skincare Organic Marble Disc -->
        <ellipse cx="540" cy="815" rx="280" ry="50" fill="#f43f5e" opacity="0.18" filter="blur(16px)" />
        <ellipse cx="540" cy="810" rx="270" ry="46" fill="#fda4af" />
        <ellipse cx="540" cy="790" rx="260" ry="42" fill="#fff1f2" stroke="#fecdd3" stroke-width="2" />
        <ellipse cx="540" cy="790" rx="150" ry="24" fill="#000000" opacity="0.3" filter="blur(8px)" />
      `;
    }
    // 3. Sports
    else if (cat.includes('sport') || cat.includes('athletic') || templateId.includes('sports')) {
      bgGradDef = `
        <defs>
          <radialGradient id="sportsBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stop-color="#450a0a" />
            <stop offset="50%" stop-color="#180404" />
            <stop offset="100%" stop-color="#050101" />
          </radialGradient>
          <linearGradient id="speedRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#991b1b" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#sportsBg)" />
        <!-- Diagonal Dynamic Speed Light Strips -->
        <polygon points="120,0 200,0 40,${H} -40,${H}" fill="url(#speedRed)" opacity="0.25" />
        <polygon points="980,0 1060,0 900,${H} 820,${H}" fill="url(#speedRed)" opacity="0.3" />
      `;
      spotlightDef = `
        <circle cx="540" cy="740" r="260" fill="#ef4444" opacity="0.25" filter="blur(45px)" />
      `;
      podiumDef = `
        <polygon points="300,840 780,840 850,890 230,890" fill="#0a0303" stroke="#ef4444" stroke-width="2" />
        <polygon points="340,790 740,790 800,840 280,840" fill="#1f0909" stroke="#f87171" stroke-width="2" />
        <ellipse cx="540" cy="815" rx="170" ry="28" fill="#000000" opacity="0.85" filter="blur(10px)" />
      `;
    }
    // 4. Food
    else if (cat.includes('food') || templateId.includes('food')) {
      bgGradDef = `
        <defs>
          <radialGradient id="foodBg" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#451a03" />
            <stop offset="45%" stop-color="#270e02" />
            <stop offset="85%" stop-color="#140601" />
            <stop offset="100%" stop-color="#050200" />
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#foodBg)" />
        <ellipse cx="540" cy="200" r="320" fill="#f59e0b" opacity="0.25" filter="blur(60px)" />
      `;
      spotlightDef = `
        <polygon points="480,0 600,0 760,780 320,780" fill="#fde68a" opacity="0.14" filter="blur(15px)" />
      `;
      podiumDef = `
        <!-- Warm Reclaimed Wood / Marble Board -->
        <ellipse cx="540" cy="815" rx="300" ry="52" fill="#000000" opacity="0.6" filter="blur(14px)" />
        <ellipse cx="540" cy="805" rx="290" ry="48" fill="#78350f" />
        <ellipse cx="540" cy="785" rx="280" ry="44" fill="#92400e" stroke="#d97706" stroke-width="2.5" />
        <ellipse cx="540" cy="785" rx="160" ry="26" fill="#000000" opacity="0.75" filter="blur(8px)" />
      `;
    }
    // 5. Fashion
    else if (cat.includes('fashion') || templateId.includes('fashion')) {
      bgGradDef = `
        <defs>
          <radialGradient id="fashionBg" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#3f3f46" />
            <stop offset="50%" stop-color="#18181b" />
            <stop offset="100%" stop-color="#09090b" />
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#fashionBg)" />
        <circle cx="540" cy="300" r="280" fill="#fb7185" opacity="0.15" filter="blur(50px)" />
      `;
      spotlightDef = `
        <polygon points="460,0 620,0 800,800 280,800" fill="#ffffff" opacity="0.15" filter="blur(20px)" />
      `;
      podiumDef = `
        <!-- Minimal Concrete Pedestal Cube -->
        <polygon points="340,845 740,845 800,890 280,890" fill="#18181b" stroke="#3f3f46" stroke-width="2" />
        <polygon points="370,795 710,795 765,845 315,845" fill="#27272a" stroke="#e4e4e7" stroke-width="2" />
        <ellipse cx="540" cy="820" rx="160" ry="26" fill="#000000" opacity="0.8" filter="blur(8px)" />
      `;
    }
    // 6. Home Decor
    else if (cat.includes('home') || cat.includes('decor') || templateId.includes('homedecor')) {
      bgGradDef = `
        <defs>
          <radialGradient id="decorBg" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stop-color="#78716c" />
            <stop offset="55%" stop-color="#292524" />
            <stop offset="100%" stop-color="#0c0a09" />
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#decorBg)" />
        <!-- Minimal Architectural Arch -->
        <path d="M 380,${H} L 380,240 Q 540,140 700,240 L 700,${H}" fill="#1c1917" opacity="0.45" />
      `;
      spotlightDef = `
        <circle cx="540" cy="300" r="260" fill="#fde68a" opacity="0.2" filter="blur(40px)" />
      `;
      podiumDef = `
        <ellipse cx="540" cy="815" rx="270" ry="46" fill="#1c1917" />
        <ellipse cx="540" cy="795" rx="260" ry="42" fill="#44403c" stroke="#a8a29e" stroke-width="2" />
        <ellipse cx="540" cy="795" rx="150" ry="25" fill="#000000" opacity="0.8" filter="blur(8px)" />
      `;
    }
    // 7. Electronics & General (Default Emerald/Teal or Royal Blue)
    else {
      bgGradDef = `
        <defs>
          <radialGradient id="defaultBg" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#0f3a3a" />
            <stop offset="45%" stop-color="#082525" />
            <stop offset="85%" stop-color="#031414" />
            <stop offset="100%" stop-color="#010a0a" />
          </radialGradient>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#defaultBg)" />
      `;
      spotlightDef = `
        <polygon points="460,0 620,0 860,780 220,780" fill="#2dd4bf" opacity="0.14" filter="blur(18px)" />
      `;
      podiumDef = `
        <polygon points="310,840 770,840 850,890 230,890" fill="#031a1a" stroke="#0d9488" stroke-width="2" />
        <polygon points="350,790 730,790 800,840 280,840" fill="#0f766e" stroke="#5eead4" stroke-width="2.5" />
        <ellipse cx="540" cy="815" rx="160" ry="26" fill="#000000" opacity="0.85" filter="blur(10px)" />
      `;
    }

    const svgString = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        ${bgGradDef}
        ${spotlightDef}
        ${podiumDef}
      </svg>
    `;

    return sharp(Buffer.from(svgString)).png().toBuffer();
  }
}

module.exports = new ImageGenService();
