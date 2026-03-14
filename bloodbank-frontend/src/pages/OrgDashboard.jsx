import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import RequestForm from "../components/RequestForm";
import "./OrgDashboard.css";

export default function OrgDashboard() {
  const { user } = useContext(AuthContext);
  const [inventory, setInventory] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([api.get("/organisation/inventory"), api.get("/organisation/requests")])
      .then(([invRes, reqRes]) => {
        setInventory(invRes.data.inventory);
        setRequests(reqRes.data.requests || []);
      })
      .catch(() => {
        setInventory(null);
        setRequests([]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const groups = inventory?.groups || {};
  const totalUnits = Object.values(groups).reduce((sum, v) => sum + Number(v || 0), 0);
  const lowStockGroups = Object.entries(groups).filter(([, v]) => Number(v || 0) < 5);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const recentRequests = requests.slice(0, 5);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger"></div>
      </div>
    );
  }

  return (
    <div className="org-dashboard">
      <section className="org-hero">
        <div className="org-hero-content">
          <div className="org-badge">Institute Console</div>
          <h1>
            {user?.name || "Institute"}
            <span>Operations Hub</span>
          </h1>
          <p>
            Monitor stock, approve requests, and request admin supply when critical.
          </p>
          <div className="org-hero-actions">
            <Link to="/inventory" className="btn btn-danger">View Inventory</Link>
            <Link to="/org/requests" className="btn btn-outline-light">Review Requests</Link>
          </div>
        </div>
        <div className="org-hero-card">
          <div className="org-hero-metric">
            <span>Total Units</span>
            <strong>{totalUnits}</strong>
          </div>
          <div className="org-hero-metric">
            <span>Pending Requests</span>
            <strong>{pendingCount}</strong>
          </div>
          <div className="org-hero-metric">
            <span>Low Stock Groups</span>
            <strong>{lowStockGroups.length}</strong>
          </div>
          <div className="org-hero-metric small">
            <span>Last Updated</span>
            <strong>
              {inventory?.lastUpdated
                ? new Date(inventory.lastUpdated).toLocaleString()
                : "N/A"}
            </strong>
          </div>
        </div>
      </section>

      <section className="org-grid">
        <div className="org-card">
          <h3>Quick Actions</h3>
          <div className="org-actions">
            <Link to="/inventory" className="org-action">Inventory</Link>
            <Link to="/org/requests" className="org-action">Requests</Link>
            <Link to="/org/transactions" className="org-action">Transactions</Link>
            <Link to="/profile" className="org-action">Profile</Link>
          </div>
        </div>

        <div className="org-card">
          <h3>Low Stock Alerts</h3>
          {lowStockGroups.length === 0 ? (
            <p className="muted">No low stock groups right now.</p>
          ) : (
            <div className="org-tags">
              {lowStockGroups.map(([g, v]) => (
                <span key={g}>
                  {g}: {v}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="org-card">
          <h3>Recent Requests</h3>
          {recentRequests.length === 0 ? (
            <p className="muted">No recent requests.</p>
          ) : (
            <ul className="org-list">
              {recentRequests.map((r) => (
                <li key={r._id}>
                  <span>{r.bloodGroup}</span>
                  <em>{r.requestType}</em>
                  <strong>{r.status}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="org-supply">
        <div className="org-supply-form">
          <h3>Request Admin Supply</h3>
          <p className="muted">
            Use this when your stock is critically low. Admin will allocate blood from another
            institute.
          </p>
          <RequestForm allowedTypes={["ADMIN_SUPPLY"]} initialType="ADMIN_SUPPLY" />
        </div>
        <div className="org-supply-panel">
          <h3>Response Guidelines</h3>
          <ul>
            <li>Provide accurate units and blood group.</li>
            <li>Include emergency notes for prioritization.</li>
            <li>Track approval in the Requests panel.</li>
          </ul>
          <div className="org-cta">
            <span>Need urgent help?</span>
            <Link to="/org/requests">Open Requests</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
