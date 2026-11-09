/**
 * OmniMarket AI - Template Model
 * Defines category-specific visual layouts, color palettes, and styling rules.
 */

const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    templateName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true,
      enum: ['Electronics', 'Gaming', 'Skincare', 'Fashion', 'Food', 'Sports', 'Home Decor', 'General']
    },
    backgroundStyle: {
      type: String,
      required: true
    },
    promptKeyword: {
      type: String,
      default: ''
    },
    layoutConfiguration: {
      width: { type: Number, default: 1080 },
      height: { type: Number, default: 1080 },
      badgePosition: { type: String, default: 'top-right' },
      ctaStyle: { type: String, default: 'pill' }
    },
    colorScheme: {
      primary: { type: String, default: '#3b82f6' },
      secondary: { type: String, default: '#1d4ed8' },
      accent: { type: String, default: '#60a5fa' },
      textPrimary: { type: String, default: '#ffffff' },
      textSecondary: { type: String, default: '#94a3b8' },
      badgeBg: { type: String, default: 'rgba(30, 64, 175, 0.85)' }
    },
    textPosition: {
      headlineY: { type: Number, default: 140 },
      titleY: { type: Number, default: 200 },
      featuresY: { type: Number, default: 250 },
      ctaY: { type: Number, default: 980 }
    },
    productImagePosition: {
      centerX: { type: Number, default: 540 },
      bottomY: { type: Number, default: 780 },
      maxHeight: { type: Number, default: 460 },
      maxWidth: { type: Number, default: 460 }
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Template', templateSchema);
