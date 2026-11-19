const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.post('/', postController.savePost);
router.post('/save', postController.savePost);
router.get('/history', postController.getHistory);
router.get('/count', postController.getCount);
router.get('/:postId/sync-insights', postController.syncInsights);

module.exports = router;
