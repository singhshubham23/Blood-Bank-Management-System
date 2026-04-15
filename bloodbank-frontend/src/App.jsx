import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";

import Requests from "./pages/Requests";
import TransactionHistory from "./pages/TransactionHistory";
import DigitalCardPage from "./pages/DigitalCardPage";
import NearbyHelp from "./pages/NearbyHelp";

// ADMIN PAGES
import AdminDashboard from "./admin-pages/AdminDashboard";
import RequestApproval from "./admin-pages/RequestApprove";
import AdminTransactions from "./admin-pages/Transactions";
import RegisterFacility from "./admin-pages/RegisterFacility";
import AdminInventory from "./admin-pages/Inventory";

// ORGANISATION / HOSPITAL DASHBOARD
import OrgDashboard from "./pages/OrgDashboard";
import OrgRequests from "./organisation/OrgRequests";
import OrgTransactions from "./organisation/OrgTransactions";

import { AuthContext } from "./context/AuthContext";
import Inventory from "./pages/Inventory";
import GlobalInventory from "./pages/GlobalInventory";

function Protected({ children, roles }) {
  const { user, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
        <p className="mt-2 text-muted">Checking Authentication...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  const { loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger"></div>
        <p className="mt-2 text-muted">Loading Application...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* NEARBY HELP — requires login (any role) */}
        <Route
          path="/nearby-help"
          element={
            <Protected>
              <NearbyHelp />
            </Protected>
          }
        />

        {/* ADMIN & ORG ONLY */}
        <Route
          path="/inventory"
          element={
            <Protected roles={["organisation", "hospital"]}>
              <Inventory />
            </Protected>
          }
        />
        <Route
          path="/global-inventory"
          element={
            <Protected roles={["admin"]}>
              <GlobalInventory />
            </Protected>
          }
        />

        {/* USER/ORG/ADMIN DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <Protected roles={["user"]}>
              <Dashboard />
            </Protected>
          }
        />

        {/* USER PAGES */}
        <Route
          path="/requests"
          element={
            <Protected roles={["user"]}>
              <Requests />
            </Protected>
          }
        />

        <Route
          path="/transactions"
          element={
            <Protected roles={["user"]}>
              <TransactionHistory />
            </Protected>
          }
        />

        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />

        <Route
          path="/digital-card"
          element={
            <Protected roles={["user"]}>
              <DigitalCardPage />
            </Protected>
          }
        />

        {/* -------------- ADMIN ROUTES -------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <Protected roles={["admin"]}>
              <AdminDashboard />
            </Protected>
          }
        />

        <Route
          path="/admin/requests"
          element={
            <Protected roles={["admin"]}>
              <RequestApproval />
            </Protected>
          }
        />

        <Route
          path="/admin/transactions"
          element={
            <Protected roles={["admin"]}>
              <AdminTransactions />
            </Protected>
          }
        />

        <Route
          path="/admin/register-facility"
          element={
            <Protected roles={["admin"]}>
              <RegisterFacility />
            </Protected>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <Protected roles={["admin"]}>
              <AdminInventory />
            </Protected>
          }
        />

        {/* -------------- ORGANISATION / HOSPITAL ROUTES -------------- */}
        <Route
          path="/org/dashboard"
          element={
            <Protected roles={["organisation", "hospital"]}>
              <OrgDashboard />
            </Protected>
          }
        />

        <Route
          path="/org/requests"
          element={
            <Protected roles={["organisation", "hospital"]}>
              <OrgRequests />
            </Protected>
          }
        />

        <Route
          path="/org/transactions"
          element={
            <Protected roles={["organisation", "hospital"]}>
              <OrgTransactions />
            </Protected>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <div className="p-5 text-center text-danger fw-bold">
              404 — Page Not Found
            </div>
          }
        />
      </Routes>
    </>
  );
}
