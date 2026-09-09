/**
 * geospatial.js
 * Geospatial distance calculation using the Haversine formula
 */

/**
 * Calculates the great-circle distance between two geographic coordinates
 * on Earth using the spherical Haversine formula.
 *
 * @param {number} lat1 - Latitude of coordinate 1 in degrees
 * @param {number} lon1 - Longitude of coordinate 1 in degrees
 * @param {number} lat2 - Latitude of coordinate 2 in degrees
 * @param {number} lon2 - Longitude of coordinate 2 in degrees
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0; // Earth's mean radius in kilometers

  const toRad = (deg) => (deg * Math.PI) / 180;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  // Haversine core equation
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Filters and returns user profiles located within a given radius
 * (default 50 kilometers) of an alert's latitude and longitude.
 *
 * @param {Array<Object>} users - List of user profile objects with latitude and longitude
 * @param {number} alertLat - Alert latitude in decimal degrees
 * @param {number} alertLon - Alert longitude in decimal degrees
 * @param {number} [radiusKm=50] - Threshold radius in kilometers (default: 50 km)
 * @returns {Array<Object>} Filtered users sorted by proximity with attached `distanceKm`
 */
function findUsersWithinRadius(users, alertLat, alertLon, radiusKm = 50) {
  if (!Array.isArray(users) || alertLat == null || alertLon == null) {
    return [];
  }

  const results = [];

  for (const user of users) {
    if (user.latitude == null || user.longitude == null) continue;

    const distance = haversineDistance(
      Number(alertLat),
      Number(alertLon),
      Number(user.latitude),
      Number(user.longitude)
    );

    const distanceKm = Math.round(distance * 100) / 100;

    if (distanceKm <= radiusKm) {
      results.push({
        ...user,
        distanceKm
      });
    }
  }

  // Sort ascending by proximity (closest users receive priority)
  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = {
  haversineDistance,
  findUsersWithinRadius
};
