import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, setUser, loadingAuth } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bloodGroup: "",
    location: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Load form values when user becomes available
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bloodGroup: user.bloodGroup || "",
        location: user.location || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/auth/update", form);

      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMsg("Profile updated successfully!");
    } catch {
      setMsg("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // GLOBAL LOADER WHILE USER FETCHES
  if (loadingAuth) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger mb-3"></div>
        <h5>Loading your profile...</h5>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container text-center py-5">
        <h3 className="text-danger">You must be logged in to view this page.</h3>
      </div>
    );
  }

  return (
    <>
      {/* Banner */}
      <div className="bg-danger text-white text-center py-4 shadow-sm">
        <h2 className="fw-bold mb-0">
          <i className="bi bi-person-badge me-2"></i> Your Profile
        </h2>
        <p className="mb-0 small">Manage your personal details</p>
      </div>

      <div className="container py-5" style={{ maxWidth: "650px" }}>
        <div className="card shadow border-0 p-4 rounded-4">

          {/* Avatar Section */}
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-danger d-flex justify-content-center align-items-center shadow"
              style={{ width: "95px", height: "95px" }}
            >
              <i className="bi bi-person-fill text-white fs-1"></i>
            </div>

            <h4 className="mt-3 mb-1 text-danger fw-bold text-uppercase">
              {user?.name || "Unknown User"}
            </h4>

            <span className="badge bg-light text-danger px-3 py-2 fw-semibold border border-danger">
              {(user?.role || "user").toUpperCase()}
            </span>
          </div>

          {/* Success / Error Message */}
          {msg && (
            <div className="alert alert-info text-center animate__animated animate__fadeIn">
              {msg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit}>

            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Name</label>
              <div className="input-group">
                <span className="input-group-text bg-danger text-white">
                  <i className="bi bi-person-fill"></i>
                </span>
                <input
                  name="name"
                  className="form-control"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <div className="input-group">
                <span className="input-group-text bg-danger text-white">
                  <i className="bi bi-telephone-fill"></i>
                </span>
                <input
                  name="phone"
                  className="form-control"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Blood Group */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Blood Group</label>
              <div className="input-group">
                <span className="input-group-text bg-danger text-white">
                  <i className="bi bi-droplet-half"></i>
                </span>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={form.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Location</label>
              <div className="input-group">
                <span className="input-group-text bg-danger text-white">
                  <i className="bi bi-geo-alt-fill"></i>
                </span>
                <input
                  name="location"
                  className="form-control"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              className="btn btn-danger w-100 fw-bold py-2 shadow-sm"
              disabled={saving}
            >
              {saving ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}
