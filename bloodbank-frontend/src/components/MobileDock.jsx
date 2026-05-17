import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/* Dock items per role — show the 4 most important links */
const DOCK_CONFIG = {
  user: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/dashboard" },
    { icon: "bi-card-checklist", label: "Requests", path: "/requests" },
    { icon: "bi-geo-alt-fill", label: "Nearby", path: "/nearby-help" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  admin: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "bi-check-circle", label: "Approve", path: "/admin/requests" },
    { icon: "bi-box-seam", label: "Inventory", path: "/admin/inventory" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  organisation: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
    { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
    { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  hospital: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
    { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
    { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
};

/* Full mobile overlay nav per role */
const OVERLAY_NAV = {
  user: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/dashboard" },
    { icon: "bi-card-checklist", label: "My Requests", path: "/requests" },
    { icon: "bi-cash-stack", label: "Transactions", path: "/transactions" },
    { icon: "bi-person-vcard-fill", label: "Digital Card", path: "/digital-card" },
    { icon: "bi-geo-alt-fill", label: "Nearby Help", path: "/nearby-help" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  admin: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "bi-check-circle", label: "Approve Requests", path: "/admin/requests" },
    { icon: "bi-cash-stack", label: "Transactions", path: "/admin/transactions" },
    { icon: "bi-box-seam", label: "Inventory", path: "/admin/inventory" },
    { icon: "bi-bar-chart-line", label: "Global Inventory", path: "/global-inventory" },
    { icon: "bi-graph-up-arrow", label: "Analytics", path: "/admin/analytics" },
    { icon: "bi-building-add", label: "Register Facility", path: "/admin/register-facility" },
    { icon: "bi-geo-alt-fill", label: "Nearby Help", path: "/nearby-help" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  organisation: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
    { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
    { icon: "bi-cash-stack", label: "Transactions", path: "/org/transactions" },
    { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
    { icon: "bi-geo-alt-fill", label: "Nearby Help", path: "/nearby-help" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
  hospital: [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
    { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
    { icon: "bi-cash-stack", label: "Transactions", path: "/org/transactions" },
    { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
    { icon: "bi-geo-alt-fill", label: "Nearby Help", path: "/nearby-help" },
    { icon: "bi-person-fill", label: "Profile", path: "/profile" },
  ],
};

export default function MobileDock() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [overlayOpen, setOverlayOpen] = useState(false);

  const role = user?.role || "user";
  const dockItems = DOCK_CONFIG[role] || DOCK_CONFIG.user;
  const overlayItems = OVERLAY_NAV[role] || OVERLAY_NAV.user;

  return (
    <>
      {/* ── Bottom Dock ── */}
      <div className="mobile-dock">
        <div className="dock-bar">
          {dockItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`dock-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="dock-icon"><i className={`bi ${item.icon}`}></i></span>
              <span className="dock-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Overlay Trigger ── */}
      <button
        className="mobile-overlay-trigger"
        onClick={() => setOverlayOpen(true)}
        aria-label="Open navigation menu"
      >
        <i className="bi bi-grid-3x3-gap-fill"></i>
      </button>

      {/* ── Full Overlay ── */}
      <div
        className={`mobile-overlay ${overlayOpen ? "show" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setOverlayOpen(false); }}
      >
        <div className="mobile-overlay-content">
          <div className="overlay-handle"></div>



          {/* Overlay nav items */}
          <nav className="cp-nav" style={{ padding: 0 }}>
            <div className="cp-nav-section">Navigation</div>
            {overlayItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`cp-nav-item ${location.pathname === item.path ? "active" : ""}`}
                onClick={() => setOverlayOpen(false)}
              >
                <i className={`bi ${item.icon} cp-nav-icon`}></i>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Logout */}
            <div className="cp-nav-section">Account</div>
            <button
              className="cp-nav-item"
              onClick={() => { logout(); setOverlayOpen(false); }}
              style={{ width: "100%", border: "none", textAlign: "left", fontFamily: "inherit" }}
            >
              <i className="bi bi-box-arrow-right cp-nav-icon"></i>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
