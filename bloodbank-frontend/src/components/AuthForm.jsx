import React, { useState } from "react";

export default function AuthForm({ mode = "login", onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bloodGroup: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-75 my-4">
      <div
        className="card shadow-sm border-0 rounded-4 w-100"
        style={{ maxWidth: "450px" }}
      >
        <div className="card-body p-4">
          <h4 className="text-center fw-bold text-danger mb-4">
            {mode === "login" ? "Welcome Back!" : "Create Account"}
          </h4>

          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary small text-uppercase">Full Name</label>
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white border-end-0 text-danger">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    name="name"
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Your full name"
                    value={form.name}
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-bold text-secondary small text-uppercase">Email Address</label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0 text-danger">
                  <i className="bi bi-envelope-fill"></i>
                </span>
                <input
                  name="email"
                  type="email"
                  className="form-control border-start-0"
                  placeholder="example@gmail.com"
                  value={form.email}
                  required
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control border-start-0 border-end-0"
                  placeholder="Enter password"
                  value={form.password}
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary bg-white border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} text-muted`}></i>
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Phone Number</label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0 text-danger">
                      <i className="bi bi-telephone-fill"></i>
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      className="form-control border-start-0"
                      placeholder="10-digit phone"
                      value={form.phone}
                      required
                      pattern="[0-9]{10}"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Address</label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0 text-danger align-items-start pt-2">
                      <i className="bi bi-geo-alt-fill"></i>
                    </span>
                    <textarea
                      name="address"
                      className="form-control border-start-0"
                      placeholder="Enter full address"
                      rows="2"
                      value={form.address}
                      required
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-secondary small text-uppercase">Blood Group</label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0 text-danger">
                      <i className="bi bi-droplet-fill"></i>
                    </span>
                    <select
                      name="bloodGroup"
                      className="form-select border-start-0"
                      required
                      value={form.bloodGroup}
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                        (bg) => (
                          <option key={bg} value={bg}>
                            {bg}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              className="btn btn-danger w-100 mt-2 py-2 fw-bold shadow-sm rounded-3"
              type="submit"
            >
              {mode === "login" ? (
                <>
                  Login <i className="bi bi-arrow-right-short ms-1 fs-5"></i>
                </>
              ) : (
                <>
                  Create Account <i className="bi bi-person-plus-fill ms-2"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
