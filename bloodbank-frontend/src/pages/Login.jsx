import React, { useContext } from "react";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }) => {
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #ff4b5c 0%, #ff6f61 100%)",
      }}
    >
      <div className="col-12 col-sm-10 col-md-6 col-lg-5">
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="bg-danger text-center py-4">
            <i className="bi bi-droplet-fill text-white display-4 mb-2"></i>
            <h2 className="text-white fw-bold">Welcome Back!</h2>
          </div>
          <div className="card-body p-4">
            <AuthForm mode="login" onSubmit={handleLogin} />
            <div className="text-center mt-3">
              <small className="text-muted">
                Don't have an account?{" "}
                <Link to="/register" className="text-danger fw-semibold">
                  Register
                </Link>
              </small>
            </div>
          </div>
        </div>
        <div className="text-center text-white mt-4">
          <small>BloodBank © 2025. Donate Blood, Save Lives.</small>
        </div>
      </div>
    </div>
  );
}
