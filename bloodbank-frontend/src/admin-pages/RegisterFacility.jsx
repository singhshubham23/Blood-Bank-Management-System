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
                                <label className="form-label fw-semibold">Facility Role</label>
                                <select
                                    className="form-select text-capitalize"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="organisation">Institution (Organisation)</option>
                                    <option value="hospital">Hospital</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Facility Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="name"
                                    placeholder="Enter facility name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="email"
                                    placeholder="facility@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="phone"
                                    placeholder="Enter contact number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-semibold">Location / Address</label>
                                <textarea
                                    className="form-control"
                                    name="location"
                                    rows="2"
                                    placeholder="Enter full address"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-danger w-100 fw-bold rounded-3 py-2"
                                disabled={loading}
                            >
                                {loading ? "Registering..." : "Register Facility"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
