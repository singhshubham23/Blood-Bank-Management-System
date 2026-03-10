import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, loadingAuth } = useContext(AuthContext);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "active fw-bold text-light"
      : "text-light opacity-75";

  if (loadingAuth) return null;

  const isAdmin = user?.role === "admin";
  const isOrg = user?.role === "organisation"; // hospital/org
  const isNormalUser = user && !isAdmin && !isOrg;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm sticky-top py-2">
      <div className="container-fluid">

        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center fw-bold text-light" to="/">
          <i className="bi bi-droplet-fill me-2 fs-4 animate__animated animate__pulse animate__infinite"></i>
          BloodBank
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* MENU */}
        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">

            {/* -------- ALWAYS VISIBLE: HOME -------- */}
            <li className="nav-item">
              <Link className={`nav-link ${isActive("/")}`} to="/">
                <i className="bi bi-house-door-fill me-1"></i> Home
              </Link>
            </li>

            {/* -------- INVENTORY: Only Admin + Org -------- */}
            {(isAdmin || isOrg) && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/inventory")}`}
                  to="/inventory"
                >
                  <i className="bi bi-box-seam me-1"></i> Inventory
                </Link>
              </li>
            )}

            {/* ---------------------- ADMIN DASHBOARD ---------------------- */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link text-light fw-semibold"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </button>

                <ul className="dropdown-menu dropdown-menu-end bg-danger border-0 shadow">

                  <li>
                    <Link className={`dropdown-item text-light`} to="/admin/requests">
                      <i className="bi bi-check-circle me-2"></i> Approve Requests
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/admin/transactions">
                      <i className="bi bi-cash-stack me-2"></i> Transactions
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/profile">
                      <i className="bi bi-person-fill me-2"></i> Profile
                    </Link>
                  </li>

                </ul>
              </li>
            )}

            {/* ---------------------- ORGANISATION/HOSPITAL DASHBOARD ---------------------- */}
            {isOrg && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link text-light fw-semibold"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </button>

                <ul className="dropdown-menu dropdown-menu-end bg-danger border-0 shadow">

                  <li>
                    <Link className="dropdown-item text-light" to="/requests">
                      <i className="bi bi-card-checklist me-2"></i> Requests
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/transactions">
                      <i className="bi bi-cash-stack me-2"></i> Transactions
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/profile">
                      <i className="bi bi-person-fill me-2"></i> Profile
                    </Link>
                  </li>

                </ul>
              </li>
            )}

            {/* ---------------------- NORMAL USER DASHBOARD ---------------------- */}
            {isNormalUser && (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle btn btn-link text-light fw-semibold"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </button>

                <ul className="dropdown-menu dropdown-menu-end bg-danger border-0 shadow">

                  <li>
                    <Link className="dropdown-item text-light" to="/requests">
                      <i className="bi bi-card-checklist me-2"></i> My Requests
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/transactions">
                      <i className="bi bi-cash-stack me-2"></i> My Transactions
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item text-light" to="/profile">
                      <i className="bi bi-person-fill me-2"></i> Profile
                    </Link>
                  </li>

                </ul>
              </li>
            )}

            {/* ---------------------- AUTH SECTION ---------------------- */}
            {user ? (
              <>
                {/* Username */}
                <li className="nav-item">
                  <span className="d-flex align-items-center text-light fw-semibold">
                    <i className="bi bi-person-circle me-2 fs-5"></i>
                    <span className="small">
                      {user.name}
                      <span className="badge bg-light text-danger ms-1">
                        {user.role}
                      </span>
                    </span>
                  </span>
                </li>

                {/* Logout */}
                <li className="nav-item">
                  <button
                    onClick={logout}
                    className="btn btn-light btn-sm text-danger fw-semibold px-3"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/register"
                    className="btn btn-light btn-sm text-danger fw-semibold px-3"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}
