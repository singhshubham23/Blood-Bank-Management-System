import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await api.get("/admin/analytics/summary");
        setSummary(res.data.data);
      } catch (err) {
        console.error("Failed to load summary:", err);
      }
    }
    if (user?.role === "admin") fetchSummary();
  }, [user]);

  if (!user || user.role !== "admin")
    return <h4 className="text-center text-danger mt-5">Admin Access Required</h4>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 text-danger fw-bold">Admin Dashboard</h2>

      {/* Summary Stats */}
      {summary && (
        <div className="row g-3 mb-4">
          {[
            { label: "Users", value: summary.totalUsers, icon: "bi-people-fill", color: "primary" },
            { label: "Organisations", value: summary.totalOrganisations, icon: "bi-hospital-fill", color: "success" },
            { label: "Donations", value: `${summary.totalDonations} units`, icon: "bi-droplet-fill", color: "danger" },
            { label: "Pending", value: summary.pendingRequests, icon: "bi-clock-fill", color: "warning" },
          ].map((s, i) => (
            <div key={i} className="col-6 col-md-3">
              <div className={`card border-0 shadow-sm text-center p-3 rounded-4 bg-${s.color} bg-opacity-10`}>
                <i className={`bi ${s.icon} fs-3 text-${s.color}`}></i>
                <div className="fw-bold fs-4 mt-1">{s.value}</div>
                <small className="text-muted">{s.label}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <a href="/admin/requests" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0">
              <i className="bi bi-card-checklist fs-1 text-danger"></i>
              <h5 className="mt-3 text-dark fw-semibold">Manage Requests</h5>
              <p className="small text-muted">Approve or Reject Blood Requests</p>
            </div>
          </a>
        </div>

        <div className="col-md-4">
          <a href="/admin/transactions" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0">
              <i className="bi bi-receipt fs-1 text-primary"></i>
              <h5 className="mt-3 text-dark fw-semibold">Transactions</h5>
              <p className="small text-muted">Track Blood In & Out Flow</p>
            </div>
          </a>
        </div>

        <div className="col-md-4">
          <a href="/admin/inventory" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0 h-100">
              <i className="bi bi-droplet fs-1 text-info"></i>
              <h5 className="mt-3 text-dark fw-semibold">Inventory</h5>
              <p className="small text-muted">Inventory By Institute</p>
            </div>
          </a>
        </div>

        <div className="col-md-4">
          <a href="/admin/register-facility" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0 h-100 bg-light">
              <i className="bi bi-hospital fs-1 text-success"></i>
              <h5 className="mt-3 text-dark fw-semibold">Register Facility</h5>
              <p className="small text-muted">Add Hospitals / Institutions</p>
            </div>
          </a>
        </div>

        {/* Analytics Card */}
        <div className="col-md-4">
          <a href="/admin/analytics" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0 h-100"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <i className="bi bi-graph-up-arrow fs-1 text-white"></i>
              <h5 className="mt-3 text-white fw-semibold">Analytics</h5>
              <p className="small text-white-50">Visual Trends & Insights</p>
            </div>
          </a>
        </div>
      </div>

      <div className="text-center mt-5">
        <span className="badge bg-warning text-dark px-4 py-2">
          Inventory by institute is available in Admin Inventory.
        </span>
      </div>
    </div>
  );
}
