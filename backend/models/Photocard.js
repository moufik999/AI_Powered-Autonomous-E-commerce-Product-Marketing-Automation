/**
 * OmniMarket AI - Photocard Model
 * Stores generated photocards, templates used, background assets, and CDN URLs.
 */

const mongoose = require('mongoose');

const photocardSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    templateId: {
      type: String,
      required: true,
      index: true
    },
    templateName: {
      type: String,
      default: ''
    },
    marketingHeadline: {
      type: String,
      default: ''
    },
    features: {
      type: [String],
      default: []
    },
    price: {
      type: String,
      default: ''
    },
    discount: {
      type: String,
      default: ''
    },
    offerPrice: {
      type: String,
      default: ''
    },
    backgroundImage: {
      type: String,
      required: true
    },
    finalImageUrl: {
      type: String,
      required: true
    },
    cloudinaryPublicId: {
      type: String,
      default: null
    },
    generationDate: {
      type: Date,
      default: Date.now
    },
    generationStatus: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'completed',
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Photocard', photocardSchema);
