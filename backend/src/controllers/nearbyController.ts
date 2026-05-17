import { Request, Response } from "express";
import User from "../models/User";

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export async function getNearbyBloodBanks(req: Request, res: Response) {
  try {
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;
    const radius = (req.query.radius as string) || "10";

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "Latitude and longitude are required",
      });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = Math.min(parseFloat(radius), 50) * 1000;

    let osmResults: any[] = [];
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

      const response = await fetch(overpassUrl, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "BloodBankApp/1.0"
        }
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json() as any;
        osmResults = (data.elements || [])
          .filter((el: any) => {
            const elLat = el.lat || el.center?.lat;
            const elLng = el.lon || el.center?.lon;
            return elLat && elLng;
          })
          .map((el: any) => {
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
    } catch (osmErr: any) {
      console.warn("Overpass API unavailable, falling back to DB:", osmErr.message);
    }

    let dbResults: any[] = [];
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
        distance: null,
        registeredFacility: true,
      }));
    } catch (dbErr: any) {
      console.warn("DB query failed:", dbErr.message);
    }

    const allResults = [...osmResults, ...dbResults].sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    const limitedResults = allResults.slice(0, 50);

    res.json({
      success: true,
      count: limitedResults.length,
      results: limitedResults,
      searchCenter: { lat: userLat, lng: userLng },
      searchRadiusKm: parseFloat(radius),
    });
  } catch (err: any) {
    console.error("getNearbyBloodBanks error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch nearby blood banks" });
  }
}
