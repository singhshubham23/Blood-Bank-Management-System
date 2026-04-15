const User = require("../models/User");

// Haversine formula to calculate distance between two lat/lng points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * GET /api/nearby/bloodbanks?lat=...&lng=...&radius=...
 * Queries OpenStreetMap Overpass API for nearby blood banks
 * Also returns our registered organisations/hospitals
 * No authentication required (emergency access)
 */
async function getNearbyBloodBanks(req, res) {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = Math.min(parseFloat(radius), 50) * 1000; // Convert km to meters, max 50km

    // 1. Query OpenStreetMap Overpass API
    let osmResults = [];
    try {
      const overpassQuery = `
        [out:json][timeout:10];
        (
          node["amenity"="blood_bank"](around:${searchRadius},${userLat},${userLng});
          node["amenity"="blood_donation"](around:${searchRadius},${userLat},${userLng});
          node["healthcare"="blood_bank"](around:${searchRadius},${userLat},${userLng});
          way["amenity"="blood_bank"](around:${searchRadius},${userLat},${userLng});
          way["amenity"="blood_donation"](around:${searchRadius},${userLat},${userLng});
          way["healthcare"="blood_bank"](around:${searchRadius},${userLat},${userLng});
          node["amenity"="hospital"](around:${searchRadius},${userLat},${userLng});
        );
        out center body;
      `;

      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(overpassUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        osmResults = (data.elements || [])
          .filter((el) => {
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            return elLat && elLng;
          })
          .map((el) => {
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            const distance = haversineDistance(userLat, userLng, elLat, elLng);
            const tags = el.tags || {};

            return {
              source: "openstreetmap",
              name: tags.name || tags["name:en"] || "Blood Bank",
              address:
                [tags["addr:street"], tags["addr:city"], tags["addr:state"]]
                  .filter(Boolean)
                  .join(", ") || tags.address || "Address not available",
              phone: tags.phone || tags["contact:phone"] || null,
              type: tags.amenity === "hospital" ? "Hospital" : "Blood Bank",
              lat: elLat,
              lng: elLng,
              distance: Math.round(distance * 10) / 10,
              openingHours: tags.opening_hours || null,
              website: tags.website || null,
            };
          });
      }
    } catch (osmErr) {
      console.warn("Overpass API unavailable, falling back to DB:", osmErr.message);
    }

    // 2. Query our registered organisations/hospitals from DB
    let dbResults = [];
    try {
      const orgs = await User.find({
        role: { $in: ["organisation", "hospital"] },
        location: { $exists: true, $ne: "" },
      }).select("name phone location role");

      dbResults = orgs.map((org) => ({
        source: "registered",
        name: org.name,
        address: org.location || "Address not available",
        phone: org.phone || null,
        type: org.role === "hospital" ? "Hospital" : "Blood Bank",
        lat: null,
        lng: null,
        distance: null, // can't calculate without geocoded address
        registeredFacility: true,
      }));
    } catch (dbErr) {
      console.warn("DB query failed:", dbErr.message);
    }

    // 3. Combine and sort by distance
    const allResults = [...osmResults, ...dbResults].sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    // Limit to 50 results
    const limitedResults = allResults.slice(0, 50);

    res.json({
      success: true,
      count: limitedResults.length,
      results: limitedResults,
      searchCenter: { lat: userLat, lng: userLng },
      searchRadiusKm: parseFloat(radius),
    });
  } catch (err) {
    console.error("getNearbyBloodBanks error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch nearby blood banks" });
  }
}

module.exports = { getNearbyBloodBanks };
