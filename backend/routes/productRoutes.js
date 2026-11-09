/**
 * OmniMarket AI - Product Routes
 * Catalog and inventory management routes for RAG search.
 */

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Catalog listing and search
router.get('/', productController.getAllProducts);

// Demo products seeder
router.post('/seed', productController.seedProducts);

// Single product CRUD
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
