const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: '',
      index: true
    },
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
    category: {
      type: String,
      default: '',
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
    facebookPostId: {
      type: String,
      default: ''
    },
    reactionsCount: {
      type: Number,
      default: 0
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    repliesCount: {
      type: Number,
      default: 0
    },
    sharesCount: {
      type: Number,
      default: 0
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

postSchema.index({ userEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
