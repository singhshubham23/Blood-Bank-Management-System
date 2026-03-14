import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Requests() {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering States
  const [filterStatus, setFilterStatus] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // USERS -> only their own requests
        if (user.role === "user") {
          const res = await api.get("/requests/my");
          setList(res.data || []);
        } else {
          // admin, organisation, hospital
          const res = await api.get("/requests");
          setList(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  if (!user) return <h4 className="text-center mt-5">Please Login</h4>;

  if (loading)
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger"></div>
      </div>
    );

  // Filter Logic
  const filteredList = list.filter((r) => {
    const matchesStatus = filterStatus ? r.status === filterStatus : true;
    const matchesGroup = filterGroup ? r.bloodGroup === filterGroup : true;
    const matchesType = filterType ? r.requestType === filterType : true;

    // Search mostly by Notes (for users) or Requester Name (if populated)
    const searchTarget = `${r.notes || ""} ${r.requester?.name || ""}`.toLowerCase();
    const matchesSearch = searchText ? searchTarget.includes(searchText.toLowerCase()) : true;

    return matchesStatus && matchesGroup && matchesType && matchesSearch;
  });

  return (
    <div className="container py-5">
      <h2 className="text-center text-danger mb-4 fw-bold">
        <i className="bi bi-droplet-half me-2"></i>My Requests
      </h2>

      {/* Filters + Search bar */}
      <div className="row g-3 mb-4 p-3 rounded shadow-sm bg-light">
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Search by name or notes..."
            className="form-control"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="DONATE">DONATION</option>
            <option value="RECEIVE">REQUEST</option>
            <option value="ADMIN_SUPPLY">ADMIN SUPPLY</option>
          </select>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="alert alert-warning text-center">
          <i className="bi bi-info-circle me-2"></i>No requests found matching your filters.
        </div>
      ) : (
        <div className="row g-3">
          {filteredList.map((r) => (
            <div key={r._id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h5 className="card-title text-primary d-flex justify-content-between">
                    <span>
                      {r.requestType === "DONATE"
                        ? "DONATE"
                        : r.requestType === "RECEIVE"
                          ? "RECEIVE"
                          : "ADMIN SUPPLY"}
                    </span>
                    <span className="text-danger fw-bold">{r.bloodGroup}</span>
                  </h5>

                  <p className="mb-2"><strong>Units:</strong> {r.units}</p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`badge ${r.status === "PENDING"
                          ? "bg-warning"
                          : r.status === "APPROVED"
                            ? "bg-success"
                            : r.status === "REJECTED"
                              ? "bg-danger"
                              : "bg-secondary"
                        }`}
                    >
                      {r.status}
                    </span>
                  </p>

                  {r.notes && (
                    <p className="text-muted">
                      <strong>Notes:</strong> {r.notes}
                    </p>
                  )}

                  {r.processedBy && (
                    <p className="mt-2 small text-success">
                      Processed by: {r.processedBy.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
