import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function RegisterFacility() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        role: "organisation",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await api.post("/admin/register-facility", formData);
            if (res.data.success) {
                setSuccess("Facility registered successfully!");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    location: "",
                    role: "organisation",
                });
                setTimeout(() => navigate("/admin/dashboard"), 2000);
            }
        } catch (err) {
            setError(
                err.response?.data?.error || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg rounded-4 border-0 p-4">
                        <h3 className="text-center text-danger fw-bold mb-4">
                            Register Facility
                        </h3>
                        {error && <div className="alert alert-danger">{error}</div>}
                        {success && <div className="alert alert-success">{success}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Facility Role</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger">
                                        <i className="bi bi-building-gear"></i>
                                    </span>
                                    <select
                                        className="form-select border-start-0 text-capitalize"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        <option value="organisation">Institution (Organisation)</option>
                                        <option value="hospital">Hospital</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Facility Name</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger">
                                        <i className="bi bi-hospital"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        name="name"
                                        placeholder="Enter facility name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Email Address</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger">
                                        <i className="bi bi-envelope-fill"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0"
                                        name="email"
                                        placeholder="facility@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Password</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger">
                                        <i className="bi bi-lock-fill"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0"
                                        name="password"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Phone Number</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger">
                                        <i className="bi bi-telephone-fill"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        name="phone"
                                        placeholder="Enter contact number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold text-secondary small text-uppercase">Location / Address</label>
                                <div className="input-group shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-danger align-items-start pt-2">
                                        <i className="bi bi-geo-alt-fill"></i>
                                    </span>
                                    <textarea
                                        className="form-control border-start-0"
                                        name="location"
                                        rows="2"
                                        placeholder="Enter full address"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-danger w-100 py-2 fw-bold shadow-sm rounded-3 mt-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</>
                                ) : (
                                    <><i className="bi bi-building-add me-2 fs-5"></i>Register Facility</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
