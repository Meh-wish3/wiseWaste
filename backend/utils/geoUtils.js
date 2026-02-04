/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param {Object} start - { lat, lng }
 * @param {Object} end - { lat, lng }
 * @returns {number} Distance in kilometers
 */
function getDistanceInKm(start, end) {
    // If either point is missing coordinates, return Infinity to push it to the end of the list
    if (!start || !end || start.lat === undefined || start.lng === undefined || end.lat === undefined || end.lng === undefined) {
        return Infinity;
    }

    const R = 6371; // Earth's radius in km
    const dLat = (end.lat - start.lat) * Math.PI / 180;
    const dLng = (end.lng - start.lng) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
}

module.exports = { getDistanceInKm };
