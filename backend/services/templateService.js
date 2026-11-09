/**
 * OmniMarket AI - Template Service
 * Category-based photocard design template manager.
 * Supports multiple design variations per category (Electronics, Gaming, Skincare, Fashion, Food, Sports, Home Decor).
 */

const Template = require('../models/Template');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Seed presets covering all 7 core categories with multiple variations
const DEFAULT_PRESET_TEMPLATES = [
  // 1. GAMING
  {
    templateId: 'gaming-cyber-neon',
    templateName: 'Cyber Neon Arena',
    category: 'Gaming',
    backgroundStyle: 'Dark Cyberpunk RGB Grid with Electric Cyan & Violet Neon Volumetric Lighting',
    promptKeyword: 'futuristic gaming battle station, dark metal floor, violet neon tubes, cyan laser grid, commercial empty podium stage, 8k',
    colorScheme: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#ec4899',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      badgeBg: 'rgba(15, 23, 42, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'glow-purple' },
    isDefault: true
  },
  {
    templateId: 'gaming-stealth-black',
    templateName: 'Stealth Carbon Matrix',
    category: 'Gaming',
    backgroundStyle: 'Matte Carbon Fiber and Amber Gold Laser Accents',
    promptKeyword: 'stealth carbon fiber gaming showroom, matte black surfaces, sharp amber gold accent lights, empty podium platform, ultra-sharp 8k',
    colorScheme: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      badgeBg: 'rgba(24, 24, 27, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-left', ctaStyle: 'glow-amber' },
    isDefault: false
  },

  // 2. ELECTRONICS
  {
    templateId: 'electronics-futuristic-glass',
    templateName: 'Futuristic Obsidian Glass',
    category: 'Electronics',
    backgroundStyle: 'Obsidian Glass Surface with Holographic Cyan Circle Spotlight',
    promptKeyword: 'sleek tech showroom, dark glossy obsidian glass floor, circular cyan LED halo light, empty center podium, commercial product photography, 8k',
    colorScheme: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      badgeBg: 'rgba(15, 23, 42, 0.88)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'glow-cyan' },
    isDefault: true
  },
  {
    templateId: 'electronics-minimal-silver',
    templateName: 'Anodized Silver Studio',
    category: 'Electronics',
    backgroundStyle: 'Sleek Anodized Metallic Stage with Crisp Softbox Light',
    promptKeyword: 'apple style minimalist aluminum studio, brushed silver pedestal, crisp directional softbox shadows, pure premium tech display stage, 8k',
    colorScheme: {
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      accent: '#60a5fa',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      badgeBg: 'rgba(30, 41, 59, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-blue' },
    isDefault: false
  },

  // 3. SKINCARE
  {
    templateId: 'skincare-botanical-pastels',
    templateName: 'Ethereal Botanical Ripple',
    category: 'Skincare',
    backgroundStyle: 'Warm Peach and Cream Marble with Soft Water Caustics & Sunbeams',
    promptKeyword: 'luxury skincare cosmetic studio background, soft pastel cream and warm peach tones, smooth organic marble podium, gentle water ripple shadows, ethereal morning sun, empty stage, 8k commercial',
    colorScheme: {
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#f472b6',
      textPrimary: '#ffffff',
      textSecondary: '#fed7aa',
      badgeBg: 'rgba(80, 20, 50, 0.85)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-rose' },
    isDefault: true
  },
  {
    templateId: 'skincare-pure-spa-mineral',
    templateName: 'Pure Mineral Zen',
    category: 'Skincare',
    backgroundStyle: 'Smooth River Stone & Sage Green Mist Studio',
    promptKeyword: 'organic spa wellness podium, smooth matte river stones, subtle sage green morning mist, gentle warm backlight, empty center for skincare product, 8k',
    colorScheme: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      textPrimary: '#ffffff',
      textSecondary: '#a7f3d0',
      badgeBg: 'rgba(6, 78, 59, 0.88)'
    },
    layoutConfiguration: { badgePosition: 'top-left', ctaStyle: 'pill-emerald' },
    isDefault: false
  },

  // 4. FASHION
  {
    templateId: 'fashion-luxury-runway',
    templateName: 'Vogue Editorial Minimal',
    category: 'Fashion',
    backgroundStyle: 'Architectural Textured Concrete Cube & Warm Editorial Spotlight',
    promptKeyword: 'high fashion editorial studio, textured warm concrete cube pedestal, directional dramatic spotlight casting soft shadow, warm neutral beige and sand backdrop, empty commercial stage, 8k',
    colorScheme: {
      primary: '#e11d48',
      secondary: '#9f1239',
      accent: '#fb7185',
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      badgeBg: 'rgba(28, 25, 23, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-crimson' },
    isDefault: true
  },
  {
    templateId: 'fashion-golden-velvet',
    templateName: 'Midnight Velvet Gold',
    category: 'Fashion',
    backgroundStyle: 'Deep Midnight Drapery with Warm Champagne Rim Light',
    promptKeyword: 'luxury fashion display stage, deep midnight black draped silk background, warm champagne gold spotlight, sleek polished dark pedestal, empty, 8k',
    colorScheme: {
      primary: '#d97706',
      secondary: '#b45309',
      accent: '#fcd34d',
      textPrimary: '#ffffff',
      textSecondary: '#fde68a',
      badgeBg: 'rgba(24, 24, 27, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-gold' },
    isDefault: false
  },

  // 5. FOOD & BEVERAGES
  {
    templateId: 'food-artisan-harvest',
    templateName: 'Artisan Rustic Harvest',
    category: 'Food',
    backgroundStyle: 'Aesthetic Dark Oak Wood Surface with Warm Morning Sunlight',
    promptKeyword: 'artisan gourmet food photography stage, rustic dark reclaimed oak wood, warm natural window sunlight with soft kitchen shadows, cozy cafe atmosphere, empty center for food product, 8k',
    colorScheme: {
      primary: '#f59e0b',
      secondary: '#b45309',
      accent: '#fbbf24',
      textPrimary: '#ffffff',
      textSecondary: '#fef08a',
      badgeBg: 'rgba(67, 20, 7, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-amber' },
    isDefault: true
  },
  {
    templateId: 'food-vibrant-citrus',
    templateName: 'Sunlit Citrus Garden',
    category: 'Food',
    backgroundStyle: 'Vibrant Teal and Lime Orchard Lighting with Bright Freshness',
    promptKeyword: 'bright gourmet commercial kitchen studio, fresh sunny morning lighting, smooth white ceramic surface, subtle blurred orchard foliage, empty commercial food stage, 8k',
    colorScheme: {
      primary: '#10b981',
      secondary: '#047857',
      accent: '#6ee7b7',
      textPrimary: '#ffffff',
      textSecondary: '#d1fae5',
      badgeBg: 'rgba(6, 78, 59, 0.88)'
    },
    layoutConfiguration: { badgePosition: 'top-left', ctaStyle: 'pill-teal' },
    isDefault: false
  },

  // 6. SPORTS & FITNESS
  {
    templateId: 'sports-dynamic-concrete',
    templateName: 'High-Impact Stadium Velocity',
    category: 'Sports',
    backgroundStyle: 'Dark Asphalt Pedestal with Dynamic Diagonal Neon Streaks',
    promptKeyword: 'dynamic athletic sports advertising stage, textured dark asphalt podium, diagonal energetic neon streak lines, high contrast sports arena floodlights, empty footwear pedestal, 8k',
    colorScheme: {
      primary: '#ef4444',
      secondary: '#b91c1c',
      accent: '#f87171',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
      badgeBg: 'rgba(15, 23, 42, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-red' },
    isDefault: true
  },

  // 7. HOME DECOR
  {
    templateId: 'homedecor-nordic-scandi',
    templateName: 'Nordic Sunlit Alcove',
    category: 'Home Decor',
    backgroundStyle: 'Warm Plaster Arch Alcove with Natural Oak Surface & Soft Sunlight',
    promptKeyword: 'scandinavian architectural interior showroom, warm plastered arch alcove, light oak pedestal, soft golden hour sunlight and curtain shadows, architectural digest style, empty center, 8k',
    colorScheme: {
      primary: '#d97706',
      secondary: '#92400e',
      accent: '#fbbf24',
      textPrimary: '#ffffff',
      textSecondary: '#e2e8f0',
      badgeBg: 'rgba(41, 37, 36, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-warm' },
    isDefault: true
  },

  // 8. GENERAL
  {
    templateId: 'general-commercial-emerald',
    templateName: 'Commercial Spotlight Studio',
    category: 'General',
    backgroundStyle: 'Photorealistic Teal Spotlight Stage with 3D Isometric Pedestal',
    promptKeyword: 'commercial product photography studio stage, dark emerald backdrop, overhead dramatic spotlight, clean 3d isometric pedestal platform, empty center, 8k advertising',
    colorScheme: {
      primary: '#0d9488',
      secondary: '#0f766e',
      accent: '#2dd4bf',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      badgeBg: 'rgba(4, 47, 46, 0.9)'
    },
    layoutConfiguration: { badgePosition: 'top-right', ctaStyle: 'pill-teal' },
    isDefault: true
  }
];

class TemplateService {
  /**
   * Seed templates into MongoDB if not present
   */
  async ensureTemplatesSeeded() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const count = await Template.countDocuments();
      if (count === 0) {
        logger.info('Templates collection is empty. Seeding category design presets...');
        await Template.insertMany(DEFAULT_PRESET_TEMPLATES);
        logger.info(`Successfully seeded ${DEFAULT_PRESET_TEMPLATES.length} templates across 7+ categories.`);
      }
    } catch (err) {
      logger.warn('Template seeding check skipped:', err.message);
    }
  }

  /**
   * Select the best template for a detected category
   */
  async getTemplateForCategory(category, preferredTemplateId = null) {
    if (mongoose.connection.readyState === 1) {
      await this.ensureTemplatesSeeded();

      if (preferredTemplateId) {
        const specific = await Template.findOne({ templateId: preferredTemplateId }).lean();
        if (specific) return specific;
      }

      // Try finding by exact category match
      let template = await Template.findOne({ category, isDefault: true }).lean();
      if (!template) {
        template = await Template.findOne({ category }).lean();
      }

      if (!template) {
        template = await Template.findOne({ category: 'General' }).lean();
      }

      if (template) return template;
    }

    // In-memory fallback
    if (preferredTemplateId) {
      const specific = DEFAULT_PRESET_TEMPLATES.find(t => t.templateId === preferredTemplateId);
      if (specific) return specific;
    }

    return DEFAULT_PRESET_TEMPLATES.find(t => t.category === category && t.isDefault) ||
           DEFAULT_PRESET_TEMPLATES.find(t => t.category === category) ||
           DEFAULT_PRESET_TEMPLATES.find(t => t.category === 'General') ||
           DEFAULT_PRESET_TEMPLATES[0];
  }

  /**
   * Get all templates available for a category (for variation selection)
   */
  async getTemplatesByCategory(category) {
    if (mongoose.connection.readyState === 1) {
      await this.ensureTemplatesSeeded();
      const templates = await Template.find({ category }).lean();
      if (templates && templates.length > 0) return templates;
    }

    return DEFAULT_PRESET_TEMPLATES.filter(t => t.category === category || t.category === 'General');
  }

  /**
   * Get all system templates
   */
  async getAllTemplates() {
    if (mongoose.connection.readyState === 1) {
      await this.ensureTemplatesSeeded();
      const templates = await Template.find({}).sort({ category: 1, isDefault: -1 }).lean();
      if (templates && templates.length > 0) return templates;
    }

    return DEFAULT_PRESET_TEMPLATES;
  }
}

module.exports = new TemplateService();
