/**
 * OmniMarket AI - Product Model
 * Stores e-commerce inventory items used for RAG context retrieval and marketing generation.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [160, 'Product title cannot exceed 160 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number']
    },
    currency: {
      type: String,
      default: 'BDT',
      trim: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    features: {
      type: [String],
      default: []
    },
    imageUrl: {
      type: String,
      default: ''
    },
    stock: {
      type: Number,
      default: 10,
      min: [0, 'Stock cannot be negative']
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Full-text search index for RAG retrieval
productSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    category: 3,
    description: 1
  },
  name: 'ProductTextIndex'
});

module.exports = mongoose.model('Product', productSchema);
