const PickupRequest = require('../models/PickupRequest');
const { getDistanceInKm } = require('../utils/geoUtils');

// Optional: Define centers for wards to start the route
// using a default central point for Guwahati/Example if specific ward center is unknown
const DEFAULT_START_LOCATION = { lat: 26.1445, lng: 91.7362 }; // Example: Bhetapara

async function generateShiftRoute(wardNumber, collectorId) {
  // 1. Fetch pending pickups OR pickups already assigned to this collector
  // Fix: Assign pickups to avoid race conditions between collectors
  const query = {
    wardNumber: wardNumber,
    $or: [
      { status: 'pending' },
      { status: 'assigned', assignedTo: collectorId }
    ]
  };

  const allPickups = await PickupRequest.find(query).lean();

  if (!allPickups.length) return [];

  // 2. Assign any 'pending' pickups to this collector immediately
  const pendingIds = allPickups
    .filter(p => p.status === 'pending')
    .map(p => p._id);

  if (pendingIds.length > 0) {
    await PickupRequest.updateMany(
      { _id: { $in: pendingIds } },
      { $set: { status: 'assigned', assignedTo: collectorId } }
    );
    // Update local objects to reflect change
    allPickups.forEach(p => {
      if (p.status === 'pending') {
        p.status = 'assigned';
        p.assignedTo = collectorId;
      }
    });
  }

  // 3. Separate into Priority (Overflow) and Standard queues
  const priorityPickups = [];
  const standardPickups = [];

  allPickups.forEach(p => {
    if (p.overflow) {
      priorityPickups.push(p);
    } else {
      standardPickups.push(p);
    }
  });

  // 3. Optimize Paths using Nearest Neighbor Heuristic
  // Start mainly from a default location or the first item
  // In a real app, this would be the collector's live location
  let currentLocation = DEFAULT_START_LOCATION;

  // Helper function: Greedy Nearest Neighbor Sort
  const sortNearestNeighbor = (items, startLoc) => {
    if (!items.length) return { sorted: [], endLoc: startLoc };

    const sorted = [];
    const remaining = [...items];
    let currentLoc = startLoc;

    while (remaining.length > 0) {
      let nearestIdx = -1;
      let minDist = Infinity;

      remaining.forEach((item, idx) => {
        // If item has no location, distance is Infinity (will be picked last or sequentially)
        const dist = getDistanceInKm(currentLoc, item.location);

        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });

      // If all remaining have infinite distance (no coords), pick the first one
      if (nearestIdx === -1) nearestIdx = 0;

      const nextItem = remaining[nearestIdx];
      sorted.push(nextItem);
      remaining.splice(nearestIdx, 1);

      // Update current location if valid
      if (nextItem.location && nextItem.location.lat) {
        currentLoc = nextItem.location;
      }
    }
    return { sorted, endLoc: currentLoc };
  };

  // Optimize Priority Queue first
  const priorityResult = sortNearestNeighbor(priorityPickups, currentLocation);

  // Optimize Standard Queue starting from where Priority Queue ended
  const standardResult = sortNearestNeighbor(standardPickups, priorityResult.endLoc);

  // 4. Combine Routes
  const finalRoute = [...priorityResult.sorted, ...standardResult.sorted];

  // 5. Format Output
  return finalRoute.map((p, index) => ({
    sequence: index + 1,
    pickupId: p._id,
    userId: p.userId,
    houseNumber: p.houseNumber,
    wardNumber: p.wardNumber,
    area: p.area || 'Unknown',
    wasteType: p.wasteType,
    pickupTime: p.pickupTime,
    overflow: p.overflow,
    verificationStatus: p.verificationStatus,
    location: p.location,
    explanation: p.overflow
      ? `Priority Stop: Reported Overflow. Please verify upon arrival.`
      : `Optimized Stop: Shortest path from previous location.`,
  }));
}

module.exports = {
  generateShiftRoute,
};

