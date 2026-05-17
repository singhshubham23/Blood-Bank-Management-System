// OrgProfile.jsx
import { useContext, useState, useRef } from "react";
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) return "Loading...";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      alert("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Use FormData for profile picture support
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      if (selectedFile) {
        fd.append("profilePicture", selectedFile);
      }

      const res = await api.put("/auth/update", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setEdit(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      alert("Profile Updated Successfully!");
    } catch (err) {
      alert("Error updating profile!");
    } finally {
      setSaving(false);
    }
  };

  const profilePicUrl = previewUrl || user?.profilePicture?.url;

  return (
    <div className="container py-4 d-flex justify-content-center"
      style={{ background: "#f4f8ff", minHeight: "100vh" }}>

      <div className="card shadow-lg border-0 p-4 rounded-4 w-100" style={{ maxWidth: 500 }}>
        <div className="text-center mb-3">
          {/* Profile Picture with Upload */}
          <div
            className="position-relative d-inline-block"
            style={{ cursor: edit ? "pointer" : "default" }}
            onClick={() => edit && fileInputRef.current?.click()}
            title={edit ? "Click to change profile picture" : ""}
          >
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt="Profile"
                className="rounded-circle shadow border border-3 border-primary"
                style={{ width: "80px", height: "80px", objectFit: "cover" }}
              />
            ) : (
              <i className="bi bi-person-circle text-primary" style={{ fontSize: "80px" }}></i>
            )}
            {edit && (
              <div
                className="position-absolute bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                style={{
                  bottom: "0", right: "0",
                  width: "28px", height: "28px",
                  border: "2px solid #0d6efd",
                }}
              >
                <i className="bi bi-camera-fill text-primary" style={{ fontSize: "12px" }}></i>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="d-none"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
          />

          {selectedFile && (
            <div className="mt-2">
              <span className="badge bg-success small">
                <i className="bi bi-image me-1"></i>{selectedFile.name}
              </span>
            </div>
          )}

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
            disabled={saving}
            className="btn btn-success w-100 d-flex justify-content-center align-items-center gap-2 fw-semibold"
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm"></span> Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle"></i> Save Changes
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
