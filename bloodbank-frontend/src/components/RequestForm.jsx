import React, { useState, useContext, useMemo, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function RequestForm({ defaultOrgId = null, allowedTypes = null, initialType = null }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const baseOptions = useMemo(() => {
    const opts = [
      { value: "RECEIVE", label: "Receive Blood" },
      { value: "DONATE", label: "Donate Blood" },
    ];
    if (["organisation", "hospital"].includes(user?.role)) {
      opts.push({ value: "ADMIN_SUPPLY", label: "Request from Admin" });
    }
    return opts;
  }, [user]);

  const options = useMemo(() => {
    if (!Array.isArray(allowedTypes) || allowedTypes.length === 0) return baseOptions;
    return baseOptions.filter((o) => allowedTypes.includes(o.value));
  }, [allowedTypes, baseOptions]);

  const [form, setForm] = useState({
    bloodGroup: "",
    units: 1,
    requestType: initialType || options[0]?.value || "RECEIVE",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!options.find((o) => o.value === form.requestType)) {
      setForm((p) => ({ ...p, requestType: options[0]?.value || "RECEIVE" }));
    }
  }, [options, form.requestType]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await api.post("/requests", { ...form, requestToOrg: defaultOrgId });

      setSuccess("Request submitted successfully!");
      setForm({
        bloodGroup: "",
        units: 1,
        requestType: initialType || options[0]?.value || "RECEIVE",
        notes: "",
      });

      setTimeout(() => navigate("/requests"), 1500);
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <form onSubmit={submit} className="bg-white border rounded-4 shadow-sm p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Heart size={26} className="text-danger" />
          <h4 className="fw-bold text-danger">Blood Request Form</h4>
        </div>

        {success && <div className="alert alert-success py-2">{success}</div>}

        {/* Request Type */}
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">Request Type</label>
          <select
            name="requestType"
            value={form.requestType}
            onChange={handleChange}
            className="form-select"
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group */}
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">Blood Group</label>
          <select
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            required
            className="form-select"
          >
            <option value="">Select Blood Group</option>
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        {/* Units */}
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">Units (Bags)</label>
          <input
            type="number"
            min="1"
            name="units"
            value={form.units}
            onChange={handleChange}
            className="form-control"
            required
          />
          <small className="text-muted">1 unit ˜ 450 ml of blood</small>
        </div>

        {/* Notes */}
        <div className="mb-3">
          <label className="form-label fw-semibold text-secondary">Additional Information</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Optional message..."
            className="form-control"
          ></textarea>
        </div>

        {/* CTA Button */}
        <button className="btn btn-danger w-100 fw-bold py-2 mt-2" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* Extra Information */}
      <div className="alert alert-info mt-4">
        {form.requestType === "ADMIN_SUPPLY"
          ? "Admin will review and allocate blood from an institute."
          : "You will be notified once the organization reviews your request."}
      </div>
    </div>
  );
}
