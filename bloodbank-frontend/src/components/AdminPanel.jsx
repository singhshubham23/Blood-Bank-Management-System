import React from "react";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  return (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-body p-4">

        <h5 className="card-title text-danger fw-bold mb-4">
          <i className="bi bi-shield-lock-fill me-2"></i>
          Admin Panel
        </h5>

        <ul className="list-group list-group-flush">
          <li className="list-group-item py-3 border-0 ps-0">
            <Link className="text-decoration-none text-dark fw-semibold" to="/admin/dashboard">
              <i className="bi bi-grid-fill text-danger me-2"></i>
              Dashboard
            </Link>
          </li>

          <li className="list-group-item py-3 border-0 ps-0">
            <Link className="text-decoration-none text-dark fw-semibold" to="/requests">
              <i className="bi bi-clipboard-check-fill text-danger me-2"></i>
              Manage Requests
            </Link>
          </li>

          <li className="list-group-item py-3 border-0 ps-0">
            <Link className="text-decoration-none text-dark fw-semibold" to="/inventory">
              <i className="bi bi-box-seam-fill text-danger me-2"></i>
              Manage Inventory
            </Link>
          </li>
        </ul>

      </div>
    </div>
  );
}
