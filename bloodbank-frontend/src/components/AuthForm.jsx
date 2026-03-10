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
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="form-control rounded-3"
                  placeholder="Your full name"
                  value={form.name}
                  required
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                name="email"
                type="email"
                className="form-control rounded-3"
                placeholder="example@gmail.com"
                value={form.email}
                required
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control rounded-3"
                  placeholder="Enter password"
                  value={form.password}
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    className="form-control rounded-3"
                    placeholder="10-digit phone"
                    value={form.phone}
                    required
                    pattern="[0-9]{10}"
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Address</label>
                  <textarea
                    name="address"
                    className="form-control rounded-3"
                    placeholder="Enter full address"
                    rows="2"
                    value={form.address}
                    required
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Blood Group</label>
                  <select
                    name="bloodGroup"
                    className="form-select rounded-3"
                    required
                    value={form.bloodGroup}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                      (bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </>
            )}

            <button
              className="btn btn-danger rounded-3 w-100 py-2 fw-semibold"
              type="submit"
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
