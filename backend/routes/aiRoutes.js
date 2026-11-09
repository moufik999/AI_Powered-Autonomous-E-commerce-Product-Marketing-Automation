/**
 * OmniMarket AI - AI Routes
 * Content generation, RAG augmentation, and backward-compatible publish endpoint.
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Standard post generation (backward compatible with original POST /api/ai/generate)
router.post('/generate', aiController.generatePost);

// RAG-augmented post generation
router.post('/generate-rag', aiController.generateRAGPost);

// Creative variations generation
router.post('/variations', aiController.generateVariations);

// Backward-compatible publish endpoint (POST /api/ai/publish)
router.post('/publish', aiController.publishToSocialMedia);

module.exports = router;
