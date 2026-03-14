import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function RequestApproval() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  // Filtering States
  const [tab, setTab] = useState("PENDING");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchText, setSearchText] = useState("");

  // Admin supply search
  const [availabilityById, setAvailabilityById] = useState({});
  const [loadingAvailabilityById, setLoadingAvailabilityById] = useState({});
  const [selectedSourceById, setSelectedSourceById] = useState({});

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const load = async () => {
      try {
        const res = await api.get("/admin/requests");
        setRequests(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Failed to load requests");
      }
    };

    load();
  }, [user]);

  const handleAction = async (id, action, sourceOrgId = null) => {
    try {
      const payload = sourceOrgId ? { action, orgId: sourceOrgId } : { action };
      const res = await api.patch(`/requests/${id}/process`, payload);
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: res.data.status } : r))
      );
    } catch (err) {
      console.log(err.response?.data);
      alert(err?.response?.data?.error || "Action failed");
    }
  };

  const fetchAvailability = async (req) => {
    setLoadingAvailabilityById((p) => ({ ...p, [req._id]: true }));
    try {
      const res = await api.get("/admin/inventory/search", {
        params: { bloodGroup: req.bloodGroup, units: req.units },
      });
      setAvailabilityById((p) => ({ ...p, [req._id]: res.data.results || [] }));
      if ((res.data.results || []).length > 0) {
        setSelectedSourceById((p) => ({ ...p, [req._id]: res.data.results[0].orgId }));
      }
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to search inventory");
    } finally {
      setLoadingAvailabilityById((p) => ({ ...p, [req._id]: false }));
    }
  };

  // Filter Logic
  const filtered = requests.filter((r) => {
    if (r.status !== tab) return false;

    const matchesGroup = filterGroup ? r.bloodGroup === filterGroup : true;
    const matchesType = filterType ? r.requestType === filterType : true;
    const matchesSearch = searchText
      ? r.requester?.name.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesGroup && matchesType && matchesSearch;
  });

  if (!user || user.role !== "admin")
    return <h4 className="text-center mt-5 text-danger fw-bold">Admin Only</h4>;

  const colCount = 6 + (tab === "PENDING" ? 1 : 0);

  return (
    <div className="container py-4">
      <h2 className="text-danger text-center fw-bold mb-4">Request Approval Panel</h2>

      {/* Tabs Section (Primary Filter) */}
      <ul className="nav nav-tabs justify-content-center mb-4">
        {["PENDING", "APPROVED", "REJECTED"].map((t) => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link fw-semibold ${tab === t ? "active" : ""} text-dark`}
              onClick={() => setTab(t)}
            >
              {t === "PENDING" && "Pending"}
              {t === "APPROVED" && "Approved"}
              {t === "REJECTED" && "Rejected"}
            </button>
          </li>
        ))}
      </ul>

      {/* Secondary Filters + Search bar */}
      <div className="row g-3 mb-4 p-3 rounded shadow-sm bg-light">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Search by Requester name..."
            className="form-control"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="col-md-4">
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
        <div className="col-md-4">
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

      {/* Table Section */}
      {filtered.length > 0 ? (
        <div className="table-responsive shadow-sm rounded-4">
          <table className="table table-striped table-hover text-center align-middle">
            <thead className="table-dark">
              <tr>
                <th>Requester</th>
                <th>Contact</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Type</th>
                <th>Status</th>
                {tab === "PENDING" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isSupply = r.requestType === "ADMIN_SUPPLY";
                const availability = availabilityById[r._id] || null;
                const loadingAvail = loadingAvailabilityById[r._id];
                const selectedSource = selectedSourceById[r._id] || "";

                return (
                  <React.Fragment key={r._id}>
                    <tr>
                      <td className="fw-semibold">{r.requester?.name || "Unknown"}</td>
                      <td>{r.requester?.phone || "Not Provided"}</td>
                      <td className="text-danger fw-bold">{r.bloodGroup}</td>
                      <td>{r.units}</td>
                      <td>{r.requestType}</td>
                      <td>
                        <span
                          className={`badge ${r.status === "PENDING"
                              ? "bg-warning text-dark"
                              : r.status === "APPROVED"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {tab === "PENDING" && (
                        <td className="d-flex justify-content-center gap-2">
                          {isSupply && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => fetchAvailability(r)}
                              disabled={loadingAvail}
                            >
                              {loadingAvail ? "Searching..." : "Find Availability"}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              isSupply
                                ? handleAction(r._id, "APPROVE", selectedSource)
                                : handleAction(r._id, "APPROVE")
                            }
                            disabled={isSupply && !selectedSource}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleAction(r._id, "REJECT")}
                          >
                            Reject
                          </button>
                        </td>
                      )}
                    </tr>

                    {isSupply && availability && (
                      <tr>
                        <td colSpan={colCount} className="text-start bg-light">
                          <div className="d-flex flex-column gap-2">
                            <div className="fw-semibold">Available Institutes</div>
                            {availability.length === 0 ? (
                              <div className="text-muted">No institute has enough units.</div>
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                <select
                                  className="form-select"
                                  value={selectedSource}
                                  onChange={(e) =>
                                    setSelectedSourceById((p) => ({
                                      ...p,
                                      [r._id]: e.target.value,
                                    }))
                                  }
                                >
                                  {availability.map((a) => (
                                    <option key={a.orgId} value={a.orgId}>
                                      {a.instituteName} | {a.institutePhone} | Units: {a.units}
                                    </option>
                                  ))}
                                </select>
                                <div className="small text-muted">
                                  Select a source institute, then click Approve to transfer units.
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center mt-5">
          <i className="bi bi-inbox fs-1 text-secondary"></i>
          <h5 className="mt-3 text-muted">No {tab.toLowerCase()} requests at the moment</h5>
        </div>
      )}

      <div className="text-center mt-5">
        <span className="badge bg-info text-dark px-4 py-2">Real-time updates coming soon</span>
      </div>
    </div>
  );
}
