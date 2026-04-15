import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function NearbyHelp() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | detecting | granted | denied
  const [userCoords, setUserCoords] = useState(null);
  const [radius, setRadius] = useState(10);
  const [manualSearch, setManualSearch] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchNearby = useCallback(
    async (lat, lng, rad) => {
      setLoading(true);
      setError("");
      setSearched(true);
      try {
        const res = await api.get("/nearby/bloodbanks", {
          params: { lat, lng, radius: rad },
        });
        setResults(res.data.results || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch nearby blood banks. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationStatus("detecting");
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocationStatus("granted");
        fetchNearby(latitude, longitude, radius);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocationStatus("denied");
        if (err.code === 1) {
          setError(
            "Location access denied. Please enable location permissions or search manually below."
          );
        } else {
          setError("Could not detect your location. Please search manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchNearby, radius]);

  // Auto-detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const handleManualSearch = async () => {
    if (!manualSearch.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      // Use Nominatim to geocode the manual input
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualSearch
        )}&limit=1`
      );
      const geoData = await geoRes.json();

      if (geoData.length === 0) {
        setError("Could not find that location. Try a different search term.");
        setLoading(false);
        return;
      }

      const { lat, lon } = geoData[0];
      setUserCoords({ lat: parseFloat(lat), lng: parseFloat(lon) });
      setLocationStatus("granted");
      await fetchNearby(parseFloat(lat), parseFloat(lon), radius);
    } catch (err) {
      setError("Search failed. Please try again.");
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (userCoords) {
      fetchNearby(userCoords.lat, userCoords.lng, newRadius);
    }
  };

  const getDirectionsUrl = (item) => {
    if (item.lat && item.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      item.name + " " + item.address
    )}`;
  };

  const getDistanceBadge = (distance) => {
    if (distance === null) return { cls: "bg-secondary", label: "Distance unknown" };
    if (distance <= 2) return { cls: "bg-success", label: `${distance} km — Very Close` };
    if (distance <= 5) return { cls: "bg-info text-dark", label: `${distance} km — Nearby` };
    if (distance <= 15) return { cls: "bg-warning text-dark", label: `${distance} km` };
    return { cls: "bg-danger", label: `${distance} km — Far` };
  };

  return (
    <div className="nearby-help-page">
      {/* Emergency Banner */}
      <div
        className="text-white text-center py-4 shadow"
        style={{
          background: "linear-gradient(135deg, #dc3545 0%, #8b0000 100%)",
        }}
      >
        <h2 className="fw-bold mb-1">
          <i className="bi bi-geo-alt-fill me-2 animate__animated animate__pulse animate__infinite"></i>
          Nearby Blood Banks
        </h2>
        <p className="mb-2 opacity-75">
          Find the nearest blood banks & hospitals in an emergency
        </p>
        <a
          href="tel:108"
          className="btn btn-light btn-sm fw-bold text-danger px-4 py-2 rounded-pill shadow-sm"
          id="emergency-call-btn"
        >
          <i className="bi bi-telephone-fill me-2"></i>
          Emergency? Call 108
        </a>
      </div>

      <div className="container py-4">
        {/* Search Controls */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="row g-3 align-items-end">
              {/* Manual Search */}
              <div className="col-md-5">
                <label className="form-label fw-semibold text-secondary small">
                  <i className="bi bi-search me-1"></i> Search Location
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  placeholder="e.g., New Delhi, Mumbai, Jaipur..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  id="nearby-search-input"
                />
              </div>

              {/* Radius */}
              <div className="col-md-3">
                <label className="form-label fw-semibold text-secondary small">
                  <i className="bi bi-bullseye me-1"></i> Search Radius
                </label>
                <select
                  className="form-select rounded-3"
                  value={radius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  id="nearby-radius-select"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={30}>30 km</option>
                  <option value={50}>50 km</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="col-md-4 d-flex gap-2">
                <button
                  className="btn btn-danger flex-fill rounded-3 fw-semibold"
                  onClick={handleManualSearch}
                  disabled={loading || !manualSearch.trim()}
                  id="nearby-search-btn"
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-search me-2"></i>
                  )}
                  Search
                </button>
                <button
                  className="btn btn-outline-danger rounded-3 fw-semibold"
                  onClick={detectLocation}
                  disabled={loading}
                  title="Use my current location"
                  id="nearby-gps-btn"
                >
                  <i className="bi bi-crosshair"></i>
                </button>
              </div>
            </div>

            {/* Location Detection Status */}
            {locationStatus === "detecting" && (
              <div className="mt-3 text-center text-muted">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Detecting your location...
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-warning d-flex align-items-center rounded-3 shadow-sm" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
            <div>{error}</div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted fw-semibold">Searching for nearby blood banks...</p>
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <>
            {/* Result Count */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-list-ul me-2"></i>
                {results.length} {results.length === 1 ? "Result" : "Results"} Found
              </h5>
              {userCoords && (
                <span className="badge bg-light text-secondary border px-3 py-2">
                  <i className="bi bi-geo me-1"></i>
                  {userCoords.lat.toFixed(4)}, {userCoords.lng.toFixed(4)}
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                <i className="bi bi-geo-alt text-muted" style={{ fontSize: "64px" }}></i>
                <h5 className="mt-3 text-muted">No blood banks found nearby</h5>
                <p className="text-secondary">
                  Try increasing the search radius or searching a different location.
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {results.map((item, idx) => {
                  const distBadge = getDistanceBadge(item.distance);
                  return (
                    <div key={idx} className="col-md-6 col-lg-4" id={`nearby-result-${idx}`}>
                      <div className="card border-0 shadow-sm h-100 rounded-4 nearby-result-card">
                        <div className="card-body p-4">
                          {/* Header */}
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className={`rounded-circle d-flex align-items-center justify-content-center ${
                                  item.type === "Hospital" ? "bg-primary" : "bg-danger"
                                }`}
                                style={{ width: "40px", height: "40px", minWidth: "40px" }}
                              >
                                <i
                                  className={`bi ${
                                    item.type === "Hospital" ? "bi-hospital" : "bi-droplet-fill"
                                  } text-white`}
                                ></i>
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0 lh-sm">{item.name}</h6>
                                <small className="text-muted">{item.type}</small>
                              </div>
                            </div>
                            {item.registeredFacility && (
                              <span className="badge bg-success rounded-pill px-2 py-1" style={{ fontSize: "10px" }}>
                                <i className="bi bi-patch-check-fill me-1"></i>Verified
                              </span>
                            )}
                          </div>

                          {/* Distance */}
                          <span className={`badge ${distBadge.cls} rounded-pill px-3 py-1 mb-3`}>
                            <i className="bi bi-pin-map-fill me-1"></i>
                            {distBadge.label}
                          </span>

                          {/* Details */}
                          <div className="small text-secondary">
                            {item.address && item.address !== "Address not available" && (
                              <p className="mb-1">
                                <i className="bi bi-geo-alt me-2 text-danger"></i>
                                {item.address}
                              </p>
                            )}
                            {item.phone && (
                              <p className="mb-1">
                                <i className="bi bi-telephone me-2 text-primary"></i>
                                <a href={`tel:${item.phone}`} className="text-decoration-none">
                                  {item.phone}
                                </a>
                              </p>
                            )}
                            {item.openingHours && (
                              <p className="mb-1">
                                <i className="bi bi-clock me-2 text-success"></i>
                                {item.openingHours}
                              </p>
                            )}
                            {item.website && (
                              <p className="mb-1">
                                <i className="bi bi-globe me-2 text-info"></i>
                                <a
                                  href={item.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-decoration-none"
                                >
                                  Visit Website
                                </a>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="card-footer bg-transparent border-0 px-4 pb-3 pt-0">
                          <a
                            href={getDirectionsUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-danger w-100 rounded-3 fw-semibold btn-sm"
                          >
                            <i className="bi bi-sign-turn-right me-2"></i>
                            Get Directions
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Info Section */}
        {!searched && !loading && !error && locationStatus !== "detecting" && (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
            <i className="bi bi-geo-alt text-danger" style={{ fontSize: "64px" }}></i>
            <h5 className="mt-3 fw-bold">Find Help Near You</h5>
            <p className="text-muted mb-4">
              Allow location access or search for a city to find blood banks nearby.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <button className="btn btn-danger rounded-pill px-4 fw-semibold" onClick={detectLocation}>
                <i className="bi bi-crosshair me-2"></i>Use My Location
              </button>
              <a href="tel:108" className="btn btn-outline-dark rounded-pill px-4 fw-semibold">
                <i className="bi bi-telephone-fill me-2"></i>Call 108
              </a>
            </div>
          </div>
        )}

        {/* Emergency Tips */}
        <div className="card border-0 bg-light rounded-4 shadow-sm mt-4">
          <div className="card-body p-4">
            <h6 className="fw-bold text-danger mb-3">
              <i className="bi bi-heart-pulse-fill me-2"></i>Emergency Tips
            </h6>
            <div className="row g-3">
              {[
                {
                  icon: "bi-telephone-inbound-fill",
                  title: "Call 108",
                  desc: "National emergency ambulance number (India)",
                },
                {
                  icon: "bi-droplet-half",
                  title: "Know Your Group",
                  desc: "Keep your blood group info readily available",
                },
                {
                  icon: "bi-people-fill",
                  title: "Spread Awareness",
                  desc: "Encourage friends and family to donate regularly",
                },
                {
                  icon: "bi-clock-history",
                  title: "Golden Hour",
                  desc: "Every minute matters — act quickly in emergencies",
                },
              ].map((tip, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="text-center">
                    <i className={`bi ${tip.icon} text-danger fs-4 mb-2 d-block`}></i>
                    <h6 className="fw-bold small mb-1">{tip.title}</h6>
                    <p className="text-muted small mb-0">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Emergency Button (Mobile) */}
      <a
        href="tel:108"
        className="btn btn-danger rounded-circle shadow-lg d-md-none position-fixed"
        style={{
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1050,
        }}
        title="Call Emergency 108"
      >
        <i className="bi bi-telephone-fill fs-4"></i>
      </a>
    </div>
  );
}
