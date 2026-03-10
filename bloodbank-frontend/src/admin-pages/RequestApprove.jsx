// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";

// export default function RequestApproval() {
//   const { user } = useContext(AuthContext);
//   const [list, setList] = useState([]);

//   useEffect(() => {
//     if (!user || user.role !== "admin") return;

//     const load = async () => {
//       try {
//         const res = await api.get("/admin/requests");
//         setList(res.data || []);
//       } catch (err) {
//         alert("Failed to load requests");
//       }
//     };

//     load();
//   }, [user]);

//   const process = async (id, status) => {
//     try {
//       await api.patch(`/requests/${id}/process`, { status });
//       setList((prev) =>
//         prev.map((r) => (r._id === id ? { ...r, status } : r))
//       );
//     } catch (err) {
//       alert("Action failed");
//     }
//   };

//   if (!user || user.role !== "admin")
//     return <h4 className="text-center mt-5 text-danger">Admin Only ❗</h4>;

//   return (
//     <div className="container py-4">
//       <h2 className="text-danger text-center mb-4">Request Approval</h2>

//       <div className="row g-3">
//         {list.map((r) => (
//           <div key={r._id} className="col-md-4">
//             <div className="card shadow-sm h-100">
//               <div className="card-body">
//                 <h5 className="card-title text-primary">
//                   {r.requestType} — {r.bloodGroup} ({r.units})
//                 </h5>

//                 <p><strong>By:</strong> {r.requester?.name}</p>

//                 <p>
//                   <strong>Status:</strong>{" "}
//                   <span
//                     className={`badge ${
//                       r.status === "PENDING"
//                         ? "bg-warning"
//                         : r.status === "APPROVED"
//                         ? "bg-success"
//                         : "bg-danger"
//                     }`}
//                   >
//                     {r.status}
//                   </span>
//                 </p>

//                 {r.status === "PENDING" && (
//                   <div className="d-flex gap-2 mt-3">
//                     <button
//                       className="btn btn-success btn-sm w-50"
//                       onClick={() => process(r._id, "APPROVED")}
//                     >
//                       Approve
//                     </button>

//                     <button
//                       className="btn btn-danger btn-sm w-50"
//                       onClick={() => process(r._id, "REJECTED")}
//                     >
//                       Reject
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

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

  const handleAction = async (id, action) => {
    try {
      const res = await api.patch(`/requests/${id}/process`, { action });
      setRequests(prev =>
        prev.map(r => (r._id === id ? { ...r, status: res.data.status } : r))
      );
    } catch (err) {
      console.log(err.response?.data);
      alert("Action failed");
    }
  };


  // Filter Logic
  const filtered = requests.filter((r) => {
    // 1. Must match the current tab (Status)
    if (r.status !== tab) return false;

    // 2. Secondary Filters
    const matchesGroup = filterGroup ? r.bloodGroup === filterGroup : true;
    const matchesType = filterType ? r.requestType === filterType : true;
    const matchesSearch = searchText
      ? r.requester?.name.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesGroup && matchesType && matchesSearch;
  });

  if (!user || user.role !== "admin")
    return <h4 className="text-center mt-5 text-danger fw-bold">Admin Only ❗</h4>;

  return (
    <div className="container py-4">
      <h2 className="text-danger text-center fw-bold mb-4">
        Request Approval Panel
      </h2>

      {/* Tabs Section (Primary Filter) */}
      <ul className="nav nav-tabs justify-content-center mb-4">
        {["PENDING", "APPROVED", "REJECTED"].map((t) => (
          <li className="nav-item" key={t}>
            <button
              className={`nav-link fw-semibold ${tab === t ? "active" : ""
                } text-dark`}
              onClick={() => setTab(t)}
            >
              {t === "PENDING" && "⏳ Pending"}
              {t === "APPROVED" && "🟢 Approved"}
              {t === "REJECTED" && "🔴 Rejected"}
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
                <th>Blood Group</th>
                <th>Units</th>
                <th>Type</th>
                <th>Status</th>
                {tab === "PENDING" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r._id}>
                  <td className="fw-semibold">{r.requester?.name}</td>
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

                  {/* Show actions only when pending */}
                  {tab === "PENDING" && (
                    <td className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAction(r._id, "APPROVE")}
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
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Empty State View
        <div className="text-center mt-5">
          <i className="bi bi-inbox fs-1 text-secondary"></i>
          <h5 className="mt-3 text-muted">
            No {tab.toLowerCase()} requests at the moment
          </h5>
        </div>
      )}

      <div className="text-center mt-5">
        <span className="badge bg-info text-dark px-4 py-2">
          Real-time updates coming soon 🚀
        </span>
      </div>
    </div>
  );
}

