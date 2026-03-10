// import React, { useEffect, useState, useContext } from "react";
// import { AuthContext } from "../context/AuthContext";
// import api from "../api/axios";

// export default function AdminDashboard() {
//   const { user } = useContext(AuthContext);
//   const [inventory, setInventory] = useState([]);

//   useEffect(() => {
//     if (!user || user.role !== "admin") return;

//     const load = async () => {
//       try {
//         const res = await api.get("/admin/inventory");
//         setInventory(res.data || []);
//       } catch (err) {
//         console.error("Inventory Load Error");
//       }
//     };

//     load();
//   }, [user]);

//   if (!user || user.role !== "admin")
//     return <h4 className="text-center text-danger mt-5">Admin Access Required ❗</h4>;

//   return (
//     <div className="container py-4">
//       <h2 className="text-center mb-4 text-danger">Admin Dashboard</h2>

//       <div className="row g-3 mb-4">
//         <div className="col-md-4">
//           <a href="/admin/requests" className="text-decoration-none">
//             <div className="card shadow-sm p-4 text-center">
//               <i className="bi bi-card-checklist fs-1 text-danger"></i>
//               <h5 className="mt-3 text-dark">Manage Requests</h5>
//             </div>
//           </a>
//         </div>

//         <div className="col-md-4">
//           <a href="/admin/transactions" className="text-decoration-none">
//             <div className="card shadow-sm p-4 text-center">
//               <i className="bi bi-receipt fs-1 text-primary"></i>
//               <h5 className="mt-3 text-dark">Transactions</h5>
//             </div>
//           </a>
//         </div>

//         <div className="col-md-4">
//           <a href="/admin/inventory" className="text-decoration-none">
//             <div className="card shadow-sm p-4 text-center">
//               <i className="bi bi-droplet fs-1 text-info"></i>
//               <h5 className="mt-3 text-dark">Inventory</h5>
//             </div>
//           </a>
//         </div>
//       </div>

//       <h4 className="mt-4">Global Inventory</h4>
//       <div className="row g-3">
//         {inventory.map((inv) => (
//           <div key={inv._id} className="col-md-3">
//             <div className="card p-3 shadow-sm">
//               <h5 className="text-primary">{inv.bloodGroup}</h5>
//               <p>Units: {inv.units}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== "admin")
    return <h4 className="text-center text-danger mt-5">Admin Access Required ❗</h4>;

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 text-danger fw-bold">Admin Dashboard</h2>

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
          <a href="/inventory" className="text-decoration-none">
            <div className="card shadow-lg p-4 text-center rounded-4 border-0 h-100">
              <i className="bi bi-droplet fs-1 text-info"></i>
              <h5 className="mt-3 text-dark fw-semibold">Inventory</h5>
              <p className="small text-muted">Overall Blood Stock</p>
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
      </div>

      {/* Placeholder for Inventory Statistics */}
      <h4 className="mt-4 fw-bold text-dark">Global Inventory Overview</h4>
      <div className="row g-3 mt-2">
        {["A+", "B+", "O+", "AB+"].map((group, index) => (
          <div key={index} className="col-md-3">
            <div className="card p-3 shadow-sm rounded-4 text-center border-0">
              <i className="bi bi-heart-fill fs-2 text-danger"></i>
              <h5 className="mt-2 fw-bold">{group}</h5>
              <p className="text-muted">Units: Loading...</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-5">
        <span className="badge bg-warning text-dark px-4 py-2">
          Live Data Sync Coming Soon 🚀
        </span>
      </div>
    </div>
  );
}
