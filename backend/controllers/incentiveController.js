const Incentive = require('../models/Incentive');

async function getIncentiveForUser(req, res, next) {
  try {
    // Get userId from authenticated user or from params
    const userId = req.params.userId || req.user.userId;
    const incentive = await Incentive.findOne({ userId });
    res.json(incentive || { userId, points: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getIncentiveForUser,
};

