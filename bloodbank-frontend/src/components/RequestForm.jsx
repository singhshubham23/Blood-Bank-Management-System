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
    priority: "normal",
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
        priority: "normal",
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
          <label className="form-label fw-bold text-secondary small text-uppercase">Request Type</label>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0 text-danger">
              <i className="bi bi-ui-radios"></i>
            </span>
            <select
              name="requestType"
              value={form.requestType}
              onChange={handleChange}
              className="form-select border-start-0"
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Blood Group */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary small text-uppercase">Blood Group</label>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0 text-danger">
              <i className="bi bi-droplet-fill"></i>
            </span>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              required
              className="form-select border-start-0"
            >
              <option value="">Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Units */}
        <div className="mb-3">
          <label className="form-label fw-bold text-secondary small text-uppercase">Units (Bags)</label>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0 text-danger">
              <i className="bi bi-bag-plus"></i>
            </span>
            <input
              type="number"
              min="1"
              name="units"
              value={form.units}
              onChange={handleChange}
              className="form-control border-start-0"
              required
            />
          </div>
          <small className="text-muted d-block mt-1"><i className="bi bi-info-circle me-1"></i>1 unit ~ 450 ml of blood</small>
        </div>

        {/* Priority (only for RECEIVE requests) */}
        {form.requestType === "RECEIVE" && (
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary small text-uppercase">
              Priority Level
            </label>
            <div className="d-flex gap-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="priority"
                  id="priority-normal"
                  value="normal"
                  checked={form.priority === "normal"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="priority-normal">
                  <span className="badge bg-secondary px-3 py-2">Normal</span>
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="priority"
                  id="priority-emergency"
                  value="emergency"
                  checked={form.priority === "emergency"}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="priority-emergency">
                  <span className="badge bg-danger px-3 py-2">
                    <i className="bi bi-exclamation-circle me-1"></i>Emergency
                  </span>
                </label>
              </div>
            </div>
            {form.priority === "emergency" && (
              <div className="alert alert-danger mt-3 py-2 small mb-0 shadow-sm border-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Emergency alerts</strong> will send SMS notifications to registered donors. Use only for genuine emergencies.
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="form-label fw-bold text-secondary small text-uppercase">Additional Information</label>
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0 text-danger align-items-start pt-2">
              <i className="bi bi-card-text"></i>
            </span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Optional message or location details..."
              className="form-control border-start-0"
            ></textarea>
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="btn btn-danger w-100 py-2 fw-bold shadow-sm rounded-3 mt-2"
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
          ) : form.priority === "emergency" ? (
            <><i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>Submit Emergency Request</>
          ) : (
            <><i className="bi bi-send-fill me-2 fs-5"></i>Submit Request</>
          )}
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