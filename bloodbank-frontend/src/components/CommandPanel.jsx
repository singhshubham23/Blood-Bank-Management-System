import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/* ─── Nav config per role ─── */
const NAV_CONFIG = {
  user: [
    {
      section: "Main",
      items: [
        { icon: "bi-speedometer2", label: "Dashboard", path: "/dashboard" },
        { icon: "bi-card-checklist", label: "My Requests", path: "/requests" },
        { icon: "bi-cash-stack", label: "Transactions", path: "/transactions" },
        { icon: "bi-plus-circle", label: "Create Request", path: "/create-request" },
      ],
    },
    {
      section: "Quick Access",
      pills: [
        { label: "Nearby Help", path: "/nearby-help" },
        { label: "Profile", path: "/profile" },
      ],
    },
  ],
  admin: [
    {
      section: "Administration",
      items: [
        { icon: "bi-speedometer2", label: "Dashboard", path: "/admin/dashboard" },
        { icon: "bi-check-circle", label: "Approve Requests", path: "/admin/requests" },
        { icon: "bi-cash-stack", label: "Transactions", path: "/admin/transactions" },
        { icon: "bi-box-seam", label: "Inventory", path: "/admin/inventory" },
      ],
    },
    {
      section: "Tools",
      pills: [
        { label: "Global Inventory", path: "/global-inventory" },
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Register Facility", path: "/admin/register-facility" },
      ],
    },
    {
      section: "Account",
      items: [
        { icon: "bi-geo-alt-fill", label: "Nearby Help", path: "/nearby-help" },
        { icon: "bi-person-fill", label: "Profile", path: "/profile" },
      ],
    },
  ],
  organisation: [
    {
      section: "Organisation",
      items: [
        { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
        { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
        { icon: "bi-cash-stack", label: "Transactions", path: "/org/transactions" },
        { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
      ],
    },
    {
      section: "Quick Access",
      pills: [
        { label: "Nearby Help", path: "/nearby-help" },
        { label: "Profile", path: "/profile" },
      ],
    },
  ],
  hospital: [
    {
      section: "Hospital",
      items: [
        { icon: "bi-speedometer2", label: "Dashboard", path: "/org/dashboard" },
        { icon: "bi-card-checklist", label: "Requests", path: "/org/requests" },
        { icon: "bi-cash-stack", label: "Transactions", path: "/org/transactions" },
        { icon: "bi-box-seam", label: "Inventory", path: "/inventory" },
      ],
    },
    {
      section: "Quick Access",
      pills: [
        { label: "Nearby Help", path: "/nearby-help" },
        { label: "Profile", path: "/profile" },
      ],
    },
  ],
};

const ROLE_LABELS = {
  user: "Standard User",
  admin: "Administrator",
  organisation: "Organisation",
  hospital: "Hospital",
};

export default function CommandPanel() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role || "user";
  const navSections = NAV_CONFIG[role] || NAV_CONFIG.user;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="command-panel">
      {/* ── Header ── */}
      <div className="cp-header">
        <Link to="/" className="cp-brand">
          <div className="cp-brand-icon">🩸</div>
          <div>
            <div className="cp-brand-text">BloodBank</div>
            <div className="cp-brand-sub">Command Center</div>
          </div>
        </Link>


      </div>

      {/* ── Role Badge ── */}
      <div className="cp-role-badge">
        <span className="cp-role-dot"></span>
        <span className="cp-role-label">{ROLE_LABELS[role] || role}</span>
      </div>

      {/* ── Navigation ── */}
      <nav className="cp-nav">
        {navSections.map((section, si) => (
          <React.Fragment key={si}>
            <div className="cp-nav-section">{section.section}</div>

            {/* Standard nav items */}
            {section.items &&
              section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`cp-nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  <i className={`bi ${item.icon} cp-nav-icon`}></i>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`cp-nav-badge ${item.badgeType || ""}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

            {/* Floating pills */}
            {section.pills && (
              <div className="cp-pills staggered">
                {section.pills.map((pill) => (
                  <Link
                    key={pill.path}
                    to={pill.path}
                    className={`cp-pill ${location.pathname === pill.path ? "active" : ""}`}
                  >
                    {pill.label}
                  </Link>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* ── Activity Ring ── */}
      <div className="cp-activity">
        <div className="cp-activity-title">Platform Activity</div>
        <div className="cp-activity-row">
          <div className="cp-ring">
            <svg viewBox="0 0 64 64">
              <circle className="cp-ring-bg" cx="32" cy="32" r="24" />
              <circle className="cp-ring-1" cx="32" cy="32" r="24" />
              <circle className="cp-ring-bg" cx="32" cy="32" r="19" />
              <circle className="cp-ring-2" cx="32" cy="32" r="19" />
              <circle className="cp-ring-bg" cx="32" cy="32" r="14" />
              <circle className="cp-ring-3" cx="32" cy="32" r="14" />
            </svg>
            <div className="cp-ring-center">87%</div>
          </div>
          <div className="cp-stats">
            <div className="cp-stat">
              <span className="cp-stat-dot" style={{ background: "var(--cp-accent)" }}></span>
              Donations
            </div>
            <div className="cp-stat">
              <span className="cp-stat-dot" style={{ background: "var(--cp-accent2)" }}></span>
              Requests
            </div>
            <div className="cp-stat">
              <span className="cp-stat-dot" style={{ background: "var(--cp-accent3)" }}></span>
              Approvals
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="cp-footer">
        <div className="cp-avatar">{getInitials(user?.name)}</div>
        <div className="cp-user-info">
          <div className="cp-user-name">{user?.name || "User"}</div>
          <div className="cp-user-role">{ROLE_LABELS[role] || role}</div>
        </div>
        <Link to="/profile" className="cp-footer-btn" title="Settings">
          <i className="bi bi-gear"></i>
        </Link>
        <button className="cp-footer-btn" title="Logout" onClick={logout}>
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </aside>
  );
}
