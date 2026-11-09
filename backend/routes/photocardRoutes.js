/**
 * OmniMarket AI - Photocard Routes
 * Endpoints for generating AI photocards, regenerating backgrounds, and template selection.
 */

const express = require('express');
const router = express.Router();
const photocardController = require('../controllers/photocardController');

// Generate AI Photocard
router.post('/generate', photocardController.generatePhotocard);

// Regenerate AI Background
router.post('/regenerate-background', photocardController.regenerateBackground);

// Get Templates (All or by category ?category=Gaming)
router.get('/templates', photocardController.getTemplates);

// Get Photocard Generation History
router.get('/history', photocardController.getHistory);

module.exports = router;
