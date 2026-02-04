const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const { addIncentivePoints, penalizeUser } = require('../services/incentiveService');

async function createPickupRequest(req, res, next) {
  try {
    const { wasteType, pickupTime, overflow, location } = req.body;

    if (!wasteType || !pickupTime) {
      return res
        .status(400)
        .json({ message: 'wasteType and pickupTime are required' });
    }

    // Get user details to populate pickup request
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'CITIZEN') {
      return res.status(403).json({ message: 'Only citizens can create pickup requests' });
    }

    const pickup = await PickupRequest.create({
      userId: user._id,
      houseNumber: user.houseNumber,
      wardNumber: user.wardNumber,
      area: user.area,
      wasteType,
      pickupTime,
      overflow: !!overflow,
      // Use provided location or fallback to user's registered location
      location: location && location.lat && location.lng ? location : user.location,
    });

    res.status(201).json(pickup);
  } catch (err) {
    next(err);
  }
}

async function listPickupRequests(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) filter.status = status;

    // Filter based on user role
    if (req.user) {
      const user = await User.findById(req.user.userId);

      if (user.role === 'CITIZEN') {
        // Citizens see only their own pickups
        filter.userId = user._id;
      } else if (user.role === 'COLLECTOR') {
        // Collectors see only pickups from their ward
        filter.wardNumber = user.wardNumber;
      }
      // Admins see all pickups (no additional filter)
    }

    const pickups = await PickupRequest.find(filter)
      .sort({ pickupTime: 1 })
      .populate('userId', 'name email houseNumber')
      .lean();

    res.json(pickups);
  } catch (err) {
    next(err);
  }
}

async function verifySegregation(req, res, next) {
  try {
    const { id } = req.params;
    const { verified, verificationStatus } = req.body;

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // Handle Segregation Verification
    if (verified !== undefined) {
      pickup.segregationVerified = verified === true;
    }

    // Handle Anti-Abuse Verification
    if (verificationStatus) {
      pickup.verificationStatus = verificationStatus;

      // Check for policy violation (False Alarm)
      if (verificationStatus === 'false_alarm' && pickup.overflow) {
        await penalizeUser(pickup.userId, 'False Priority Alarm');
      }
    }

    await pickup.save();

    res.json({ pickup });
  } catch (err) {
    next(err);
  }
}

async function completePickup(req, res, next) {
  try {
    const { id } = req.params;

    const pickup = await PickupRequest.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    pickup.status = 'completed';
    pickup.completedBy = req.user.userId;

    // Fix: Do not blindly auto-verify if it was marked as a false alarm
    if (pickup.verificationStatus === 'false_alarm') {
      pickup.segregationVerified = false;
    } else if (!pickup.segregationVerified) {
      // Only auto-verify if not already verified/rejected (and not a false alarm)
      pickup.segregationVerified = true;
    }

    await pickup.save();

    // Award points using userId instead of householdId
    let incentive = null;
    if (pickup.segregationVerified) {
      incentive = await addIncentivePoints(pickup.userId, pickup.wasteType);
    }

    res.json({ pickup, incentive });
  } catch (err) {
    next(err);
  }
}

async function cancelPickup(req, res, next) {
  try {
    const { id } = req.params;
    const pickup = await PickupRequest.findById(id);

    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }

    // Verify ownership
    if (pickup.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (pickup.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed pickup' });
    }

    // Allow cancelling assigned pickups too, but maybe notify collector? 
    // For now just allow it.
    pickup.status = 'cancelled';
    await pickup.save();

    res.json({ message: 'Pickup cancelled successfully', pickup });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createPickupRequest,
  listPickupRequests,
  verifySegregation,
  completePickup,
  cancelPickup
};

