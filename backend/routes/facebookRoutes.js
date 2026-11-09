/**
 * OmniMarket AI - Facebook Routes
 * Direct Meta Graph API publishing, diagnostics, and history.
 */

const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController');

// Publish to Facebook Page (text or photo)
router.post('/publish', facebookController.publish);

// Check Facebook Page connection status and metadata
router.get('/status', facebookController.getPageStatus);

// Get Facebook publishing history
router.get('/history', facebookController.getPublishedHistory);

module.exports = router;
