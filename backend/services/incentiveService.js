const Incentive = require('../models/Incentive');

// Simple points table per waste type
const POINTS_TABLE = {
  wet: 5,
  dry: 8,
  'e-waste': 15,
};

async function addIncentivePoints(userId, wasteType) {
  const increment = POINTS_TABLE[wasteType] || 5;

  const incentive = await Incentive.findOneAndUpdate(
    { userId },
    { $inc: { points: increment } },
    { new: true, upsert: true }
  );

  return incentive;
}

async function penalizeUser(userId, reason) {
  const penalty = -50; // Fixed penalty for false alarms

  const incentive = await Incentive.findOneAndUpdate(
    { userId },
    { $inc: { points: penalty } },
    { new: true, upsert: true }
  );

  return incentive;
}

module.exports = {
  addIncentivePoints,
  penalizeUser,
  POINTS_TABLE,
};

