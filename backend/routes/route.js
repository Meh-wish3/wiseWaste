const express = require('express');
const { generateRoute } = require('../controllers/routeController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Collector: generate optimized route for current shift (requires authentication)
router.get('/', authenticate, generateRoute);

module.exports = router;

