/**
 * OmniMarket AI - Facebook Routes
 * Direct Meta Graph API publishing, diagnostics, history, and Webhook Automation.
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

// Auto-Reply Rules API
router.get('/auto-reply-rules', facebookController.getAutoReplyRules);
router.put('/auto-reply-rules', facebookController.updateAutoReplyRules);
router.post('/auto-reply-rules', facebookController.updateAutoReplyRules);

// Webhook simulation / testing endpoint
router.post('/test-webhook', facebookController.testSimulateWebhook);

// Meta Webhook Endpoints under /api/facebook prefix
router.get('/webhook', facebookController.verifyWebhook);
router.post('/webhook', facebookController.handleWebhook);

module.exports = router;
