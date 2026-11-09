/**
 * OmniMarket AI - Marketing Content Model
 * Tracks AI generated marketing posts, drafts, and Facebook publication history.
 */

const mongoose = require('mongoose');

const marketingContentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    prompt: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      required: [true, 'Caption content is required']
    },
    platform: {
      type: String,
      default: 'Facebook',
      enum: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn']
    },
    status: {
      type: String,
      default: 'draft',
      enum: ['draft', 'published', 'failed'],
      index: true
    },
    facebookPostId: {
      type: String,
      default: null
    },
    imageUrl: {
      type: String,
      default: null
    },
    publishedAt: {
      type: Date,
      default: null
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

module.exports = mongoose.model('MarketingContent', marketingContentSchema);
