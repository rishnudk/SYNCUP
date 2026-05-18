const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// Route configurations
router.get('/', feedController.getFeeds);
router.post('/', feedController.createFeed);

module.exports = router;
