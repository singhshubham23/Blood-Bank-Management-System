// OrgRequests.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { ClipboardPulse } from "react-bootstrap-icons";

export default function OrgRequests() {
  const [list, setList] = useState([]);

  const load = () => {
    api.get("/organisation/requests").then(res => setList(res.data.requests));
  };

  const act = async (id, action) => {
    await api.patch(`/organisation/requests/${id}/process`, { action });
    load();
  };

  useEffect(load, []);

  return (
    <div className="container py-4" style={{ background: "#f8faff", minHeight: "100vh" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <ClipboardPulse className="text-warning" size={28} />
        <h3 className="fw-bold text-warning">Manage Requests</h3>
      </div>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table align-middle table-hover">
          <thead className="table-warning">
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Group</th>
              <th>Units</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(r => (
              <tr key={r._id}>
                <td>{r.requester?.name}</td>
                <td>{r.requestType}</td>
                <td className="fw-bold text-danger">{r.bloodGroup}</td>
                <td>{r.units}</td>
                <td>
                  <span
                    className={`badge ${r.status === "PENDING" ? "bg-warning text-dark" :
                      r.status === "APPROVED" ? "bg-success" : "bg-danger"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === "PENDING" && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => act(r._id, "APPROVE")}>
                        Approve
                      </button>
                      <button className="btn btn-danger btn-sm ms-2" onClick={() => act(r._id, "REJECT")}>
                        Reject
                      </button>
                    </>
                  )}
                  {r.status === "APPROVED" && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => act(r._id, "COMPLETE")}
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
