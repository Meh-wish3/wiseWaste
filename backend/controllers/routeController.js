const { generateShiftRoute, AREA_ORDER } = require('../services/routingService');
const User = require('../models/User');

async function generateRoute(req, res, next) {
  try {
    // Get collector's ward number from authenticated user
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'COLLECTOR') {
      return res.status(403).json({ message: 'Only collectors can generate routes' });
    }

    const route = await generateShiftRoute(user.wardNumber, user._id);
    res.json({
      meta: {
        wardNumber: user.wardNumber,
        explanation:
          'Simple greedy routing: group by area and visit areas in a fixed loop to avoid zig-zagging across the ward. Within each area, earlier pickup times are served first.',
        areaOrder: AREA_ORDER,
      },
      route,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateRoute,
};

