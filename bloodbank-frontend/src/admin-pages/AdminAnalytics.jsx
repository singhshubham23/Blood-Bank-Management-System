import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
} from "recharts";

const BLOOD_COLORS = {
  "A+": "#e74c3c",
  "A-": "#c0392b",
  "B+": "#3498db",
  "B-": "#2980b9",
  "O+": "#2ecc71",
  "O-": "#27ae60",
  "AB+": "#9b59b6",
  "AB-": "#8e44ad",
};

const STATUS_COLORS = {
  PENDING: "#f39c12",
  APPROVED: "#2ecc71",
  REJECTED: "#e74c3c",
  COMPLETED: "#3498db",
};

const PIE_COLORS = ["#e74c3c", "#c0392b", "#3498db", "#2980b9", "#2ecc71", "#27ae60", "#9b59b6", "#8e44ad"];

export default function AdminAnalytics() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState([]);
  const [donationTrends, setDonationTrends] = useState([]);
  const [requestByGroup, setRequestByGroup] = useState([]);
  const [requestByStatus, setRequestByStatus] = useState([]);
  const [txVolume, setTxVolume] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const [invRes, trendRes, reqRes, volRes, sumRes] = await Promise.all([
          api.get("/admin/analytics/inventory-summary"),
          api.get("/admin/analytics/donation-trends"),
          api.get("/admin/analytics/request-stats"),
          api.get("/admin/analytics/transaction-volume"),
          api.get("/admin/analytics/summary"),
        ]);

        setInventoryData(invRes.data.data || []);
        setDonationTrends(trendRes.data.data || []);
        setRequestByGroup(reqRes.data.data?.byGroup || []);
        setRequestByStatus(reqRes.data.data?.byStatus || []);
        setTxVolume(volRes.data.data || []);
        setSummary(sumRes.data.data || null);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (!user || user.role !== "admin")
    return <h4 className="text-center text-danger mt-5">Admin Access Required</h4>;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" style={{ width: "3rem", height: "3rem" }}></div>
        <p className="mt-3 text-muted fw-semibold">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics-page">
      {/* Header */}
      <div
        className="text-white text-center py-4 shadow"
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      >
        <h2 className="fw-bold mb-1">
          <i className="bi bi-graph-up-arrow me-2"></i>Analytics Dashboard
        </h2>
        <p className="mb-0 opacity-75">Real-time insights into blood bank operations</p>
      </div>

      <div className="container py-4">
        {/* Summary Stats Cards */}
        {summary && (
          <div className="row g-3 mb-4">
            {[
              { label: "Total Users", value: summary.totalUsers, icon: "bi-people-fill", color: "#3498db", bg: "#ebf5fb" },
              { label: "Organisations", value: summary.totalOrganisations, icon: "bi-hospital-fill", color: "#2ecc71", bg: "#eafaf1" },
              { label: "Total Donations", value: `${summary.totalDonations} units`, icon: "bi-droplet-fill", color: "#e74c3c", bg: "#fdedec" },
              { label: "Pending Requests", value: summary.pendingRequests, icon: "bi-clock-fill", color: "#f39c12", bg: "#fef9e7" },
              { label: "Total Requests", value: summary.totalRequests, icon: "bi-card-checklist", color: "#9b59b6", bg: "#f4ecf7" },
            ].map((stat, i) => (
              <div key={i} className="col-6 col-md">
                <div
                  className="card border-0 shadow-sm rounded-4 p-3 h-100"
                  style={{ background: stat.bg }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 45, height: 45, background: stat.color, flexShrink: 0 }}
                    >
                      <i className={`bi ${stat.icon} text-white fs-5`}></i>
                    </div>
                    <div>
                      <div className="fw-bold fs-5" style={{ color: stat.color }}>{stat.value}</div>
                      <div className="text-muted small">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Row 1: Blood Group Distribution + Request Status */}
        <div className="row g-4 mb-4">
          {/* Blood Group Distribution — Bar Chart */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-bar-chart-fill text-danger me-2"></i>
                Blood Group Distribution (All Institutes)
              </h5>
              {inventoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="group" tick={{ fontSize: 13, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 15px rgba(0,0,0,.1)" }}
                    />
                    <Bar dataKey="units" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {inventoryData.map((entry, idx) => (
                        <Cell key={idx} fill={BLOOD_COLORS[entry.group] || PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No inventory data available</p>
              )}
            </div>
          </div>

          {/* Request Status Distribution — Pie Chart */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                Request Status
              </h5>
              {requestByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                      nameKey="status"
                      label={({ status, count }) => `${status}: ${count}`}
                      labelLine={false}
                    >
                      {requestByStatus.map((entry, idx) => (
                        <Cell key={idx} fill={STATUS_COLORS[entry.status] || PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No request data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Donation Trends + Transaction Volume */}
        <div className="row g-4 mb-4">
          {/* Monthly Donation Trends — Area Chart */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-graph-up text-success me-2"></i>
                Monthly Donation Trends
              </h5>
              {donationTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={donationTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="donationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2ecc71" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 15px rgba(0,0,0,.1)" }} />
                    <Area
                      type="monotone"
                      dataKey="donations"
                      stroke="#2ecc71"
                      strokeWidth={3}
                      fill="url(#donationGradient)"
                      dot={{ r: 4, fill: "#2ecc71" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No donation trend data yet</p>
              )}
            </div>
          </div>

          {/* Transaction Volume — Stacked Bar (IN vs OUT) */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-arrow-left-right text-info me-2"></i>
                Transaction Volume (IN vs OUT)
              </h5>
              {txVolume.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={txVolume} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 15px rgba(0,0,0,.1)" }} />
                    <Legend />
                    <Bar dataKey="IN" stackId="a" fill="#2ecc71" radius={[0, 0, 0, 0]} name="Blood In" />
                    <Bar dataKey="OUT" stackId="a" fill="#e74c3c" radius={[8, 8, 0, 0]} name="Blood Out" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No transaction data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Most Requested Blood Types */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-droplet-half text-danger me-2"></i>
                Most Requested Blood Types
              </h5>
              {requestByGroup.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={requestByGroup}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="count"
                      nameKey="bloodGroup"
                      label={({ bloodGroup, count }) => `${bloodGroup} (${count})`}
                    >
                      {requestByGroup.map((entry, idx) => (
                        <Cell key={idx} fill={BLOOD_COLORS[entry.bloodGroup] || PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No request data available</p>
              )}
            </div>
          </div>

          {/* Quick Stats Table */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-table text-secondary me-2"></i>
                Inventory Breakdown
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Blood Group</th>
                      <th>Units Available</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item, i) => (
                      <tr key={i}>
                        <td>
                          <span className="fw-bold" style={{ color: BLOOD_COLORS[item.group] || "#333" }}>
                            {item.group}
                          </span>
                        </td>
                        <td className="fw-semibold">{item.units}</td>
                        <td>
                          {item.units === 0 ? (
                            <span className="badge bg-danger">Critical</span>
                          ) : item.units < 5 ? (
                            <span className="badge bg-warning text-dark">Low</span>
                          ) : (
                            <span className="badge bg-success">Adequate</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
