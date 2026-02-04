const express = require('express');
const router = express.Router();
const { getIncentiveForUser } = require('../controllers/incentiveController');
const { authenticate } = require('../middleware/auth');

// GET /api/incentives/me - Get current user's incentive points
router.get('/me', authenticate, getIncentiveForUser);

// GET /api/incentives/:userId - Get specific user's incentive points (admin)
router.get('/:userId', authenticate, getIncentiveForUser);

module.exports = router;
