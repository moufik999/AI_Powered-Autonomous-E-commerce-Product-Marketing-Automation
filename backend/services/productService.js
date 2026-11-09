/**
 * OmniMarket AI - Product Service
 * Business logic for inventory management, catalog querying, and default demo seeding.
 */

const Product = require('../models/Product');
const logger = require('../utils/logger');

const DEFAULT_SAMPLE_PRODUCTS = [
  {
    title: 'Smart Fitness Tracker Watch Pro',
    description: 'Advanced water-resistant smartwatch with real-time heart-rate monitoring, AMOLED touch display, and 14-day battery life.',
    price: 3450,
    currency: 'BDT',
    category: 'Electronics',
    tags: ['smartwatch', 'fitness', 'tech', 'gadgets', 'amar bazar'],
    features: ['AMOLED Touch Display', 'Heart-rate & SpO2 Sensor', 'Waterproof IP68', '14-Day Battery'],
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    stock: 25,
    discountPercent: 15,
    isFeatured: true
  },
  {
    title: 'Noise Cancelling Wireless Earbuds',
    description: 'Immersive deep bass wireless earbuds with active noise cancellation, Bluetooth 5.3, and ergonomic comfort fit.',
    price: 2190,
    currency: 'BDT',
    category: 'Electronics',
    tags: ['audio', 'earbuds', 'wireless', 'music', 'sound'],
    features: ['Active Noise Cancellation', '36h Playtime', 'Touch Control', 'Crystal Clear Mic'],
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600',
    stock: 40,
    discountPercent: 20,
    isFeatured: true
  },
  {
    title: 'Classic Handcrafted Leather Wallet',
    description: 'Genuine full-grain leather bifold wallet with RFID blocking technology, compact design, and multiple card slots.',
    price: 1250,
    currency: 'BDT',
    category: 'Fashion & Accessories',
    tags: ['wallet', 'leather', 'fashion', 'men', 'style'],
    features: ['100% Genuine Full-grain Leather', 'RFID Protection', '8 Card Slots', 'Slim Design'],
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
    stock: 50,
    discountPercent: 10,
    isFeatured: false
  }
];

class ProductService {
  async getAllProducts({ search = '', category = '', limit = 50, skip = 0 } = {}) {
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return { products, total };
  }

  async getProductById(id) {
    return Product.findById(id);
  }

  async createProduct(productData) {
    return Product.create(productData);
  }

  async updateProduct(id, updateData) {
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  async deleteProduct(id) {
    return Product.findByIdAndDelete(id);
  }

  /**
   * Seed default catalog products if the collection is empty
   */
  async seedDefaultProducts() {
    try {
      const count = await Product.countDocuments();
      if (count === 0) {
        logger.info('Product catalog is empty. Auto-seeding default demo products for RAG...');
        await Product.insertMany(DEFAULT_SAMPLE_PRODUCTS);
        logger.info(`Successfully seeded ${DEFAULT_SAMPLE_PRODUCTS.length} default products.`);
      }
    } catch (err) {
      logger.warn('Sample product seeding skipped:', err.message);
    }
  }
}

module.exports = new ProductService();
