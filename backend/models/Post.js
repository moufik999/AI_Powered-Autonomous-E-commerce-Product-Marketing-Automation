/**
 * OmniMarket AI - Post Model
 * Stores comprehensive AI marketing post information:
 * User reference, product attributes, RAG generated copy, Cloudinary photocard URL, and timestamps.
 */

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: [true, 'userEmail is required'],
      trim: true,
      index: true
    },
    productName: {
      type: String,
      required: [true, 'productName is required'],
      trim: true
    },
    productDetails: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    discount: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    generatedCaption: {
      type: String,
      required: [true, 'generatedCaption is required']
    },
    photocardUrl: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// Index by userEmail and createdAt descending for quick history retrieval
postSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
