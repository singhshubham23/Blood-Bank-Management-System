import React, { useContext } from "react";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register } = useContext(AuthContext);
  const nav = useNavigate();

  const handleRegister = async (data) => {
    try {
      await register(data);
      alert("Registered successfully. Please login.");
      nav("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Registration failed");
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
            <i className="bi bi-droplet-fill text-white display-4 mb-2 animate__animated animate__bounce animate__infinite"></i>
            <h2 className="text-white fw-bold m-0">Create Account</h2>
          </div>

          <div className="card-body p-4">
            <AuthForm mode="register" onSubmit={handleRegister} />

            <div className="text-center mt-3">
              <small className="text-muted">
                Already have an account?{" "}
                <a href="/login" className="text-danger fw-semibold">
                  Login
                </a>
              </small>
            </div>
          </div>
        </div>

        {/* Optional Footer Text */}
        <div className="text-center text-white mt-4">
          <small>BloodBank © 2025. Donate Blood, Save Lives.</small>
        </div>
      </div>
    </div>
  );
}
