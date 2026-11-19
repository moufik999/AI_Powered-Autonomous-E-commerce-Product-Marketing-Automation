const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const postController = require('../controllers/postController');

router.post('/generate', aiController.generatePost);
router.post('/generate-rag', aiController.generateRAGPost);
router.post('/variations', aiController.generateVariations);
router.post('/publish', aiController.publishToSocialMedia);
router.get('/posts/:postId/sync-insights', postController.syncInsights);

module.exports = router;
