const express = require('express');
const {
  createPickupRequest,
  listPickupRequests,
  verifySegregation,
  completePickup,
  cancelPickup,
} = require('../controllers/pickupController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Citizen: create new pickup request
router.post('/', createPickupRequest);

// Collector: list pickup requests (optionally filter by status/household)
router.get('/', listPickupRequests);

// Collector: verify segregation (separate from completion)
router.patch('/:id/verify', verifySegregation);

// Collector: mark pickup as completed (points awarded only if verified)
router.patch('/:id/complete', completePickup);

// Citizen: cancel pickup request
router.patch('/:id/cancel', cancelPickup);

module.exports = router;

