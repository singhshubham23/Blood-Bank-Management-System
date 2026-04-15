// OrgProfile.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function OrgProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  if (!user) return "Loading...";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    try {
      const res = await api.patch("/organisation/profile", formData);
      setUser(res.data.user); // update context state
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setEdit(false);
      alert("Profile Updated Successfully!");
    } catch (err) {
      alert("Error updating profile!");
    }
  };

  return (
    <div className="container py-4 d-flex justify-content-center"
      style={{ background: "#f4f8ff", minHeight: "100vh" }}>

      <div className="card shadow-lg border-0 p-4 rounded-4 w-100" style={{ maxWidth: 500 }}>
        <div className="text-center mb-3">
          <i className="bi bi-person-circle text-primary" style={{ fontSize: "80px" }}></i>
          <h4 className="fw-bold mt-2 text-primary">Organisation Profile</h4>
        </div>

        {/* Profile Fields */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            disabled={!edit}
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            disabled
            value={formData.email}
            onChange={handleChange}
          />
          <small className="text-muted">Email can't be changed.</small>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Phone</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            disabled={!edit}
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Role</label>
          <input type="text" className="form-control" value={user.role} disabled />
        </div>

        {/* Action Buttons */}
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="btn btn-warning w-100 d-flex justify-content-center align-items-center gap-2 fw-semibold"
          >
            <i className="bi bi-pencil-square"></i> Edit Profile
          </button>
        ) : (
          <button
            onClick={saveChanges}
            className="btn btn-success w-100 d-flex justify-content-center align-items-center gap-2 fw-semibold"
          >
            <i className="bi bi-check-circle"></i> Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
