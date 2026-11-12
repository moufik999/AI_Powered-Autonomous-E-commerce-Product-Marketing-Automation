/**
 * OmniMarket AI - Post Routes
 * Routes for saving all post info and fetching user post history.
 */

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Save all generated post information
router.post('/', postController.savePost);
router.post('/save', postController.savePost);

// Get post generation history
router.get('/history', postController.getHistory);

// Get total posts count
router.get('/count', postController.getCount);

module.exports = router;
