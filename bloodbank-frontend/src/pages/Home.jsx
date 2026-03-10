// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// export default function Home() {
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const handleStart = () => {
//     if (!user) return navigate("/register");

//     if (user.role === "admin") {
//       return navigate("/admin/dashboard"); // Admin home
//     }
//     if (user.role === "organisation" || user.role === "hospital") {
//       return navigate("/org/dashboard"); // Organization home
//     }
//     navigate("/dashboard"); // User donation request page
//   };

//   return (
//     <div
//       className="min-vh-100"
//       style={{ background: "linear-gradient(135deg, #ff4b5c, #ff6f61)" }}
//     >
//       <div className="container py-5">
//         <div className="row align-items-center mb-5">
//           <div className="col-md-6 text-center text-md-start text-white">
//             <h1 className="display-4 fw-bold">
//               Welcome{user ? `, ${user.name || "User"}` : ""} to BloodBank
//             </h1>

//             <p className="lead mt-3">
//               Donate or request blood easily. Save lives with just one click.
//             </p>

//             <div className="mt-4">
//               {!user ? (
//                 <>
//                   <Link className="btn btn-light btn-lg me-3 mb-2 fw-semibold shadow-sm" to="/register">
//                     Get Started
//                   </Link>
//                   <Link className="btn btn-outline-light btn-lg mb-2 fw-semibold" to="/login">
//                     Login
//                   </Link>
//                 </>
//               ) : (
//                 <button
//                   onClick={handleStart}
//                   className="btn btn-light btn-lg mt-2 fw-semibold shadow-sm"
//                 >
//                   Start Saving Lives ❤️
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="col-md-6 d-none d-md-block">
//             <div className="card shadow-lg border-0 p-4">
//               <h5 className="fw-semibold text-danger">How it Works</h5>
//               <ol className="list-group-numbered mt-3">
//                 <li className="list-group-item border-0 p-2">Create an account</li>
//                 <li className="list-group-item border-0 p-2">Donate or request blood</li>
//                 <li className="list-group-item border-0 p-2">Organization verifies & updates stock</li>
//               </ol>
//             </div>
//           </div>
//         </div>

//         {/* Features */}
//         <div className="row text-center mb-5">
//           {["Real-Time Updates", "Safe Community", "Help in Emergencies"].map((title, i) => (
//             <div key={i} className="col-md-4 mb-4">
//               <div className="card h-100 shadow-lg border-0 p-4 bg-white rounded-4">
//                 <h5 className="fw-bold text-danger">{title}</h5>
//                 <p className="text-secondary">Trusted system for you.</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!user) return navigate("/register");
    if (user.role === "admin") return navigate("/admin/dashboard");
    if (user.role === "organisation" || user.role === "hospital")
      return navigate("/org/dashboard");
    navigate("/dashboard");
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: "linear-gradient(to bottom, #ff4b5c, #ff6f61)" }}
    >
      {/* Hero Section */}
      <section className="container py-5 d-flex flex-column-reverse flex-md-row align-items-center text-white">
        <div className="col-md-6 text-center text-md-start">
          <h1 className="display-4 fw-bold">
            Welcome{user ? `, ${user.name || "User"}` : ""} to BloodBank
          </h1>
          <p className="lead mt-3">
            Every drop counts 💉 — Donate blood. Save lives. Support your
            community.
          </p>
          <div className="mt-4">
            {!user ? (
              <>
                <Link
                  className="btn btn-light btn-lg me-3 mb-2 fw-semibold shadow-sm"
                  to="/register"
                >
                  Get Started
                </Link>
                <Link
                  className="btn btn-outline-light btn-lg mb-2 fw-semibold"
                  to="/login"
                >
                  Login
                </Link>
              </>
            ) : (
              <button
                onClick={handleStart}
                className="btn btn-light btn-lg fw-semibold shadow-sm"
              >
                Start Saving Lives ❤️
              </button>
            )}
          </div>
        </div>

        {/* Hero Illustration */}
        <div className="col-md-6 text-center mb-4 mb-md-0">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
            className="img-fluid"
            style={{ maxHeight: "280px" }}
            alt="Blood Donation"
          />
        </div>
      </section>

      {/* Features */}
      <section className="container py-5 text-center">
        <h3 className="fw-bold text-white mb-4">Why BloodBank?</h3>
        <div className="row">
          {[
            {
              icon: "bi-heart-pulse-fill",
              title: "Real-Time Stock",
              desc: "Check blood availability instantly",
            },
            {
              icon: "bi-shield-check",
              title: "Safe & Verified",
              desc: "Trusted donors & organizations only",
            },
            {
              icon: "bi-geo-alt-fill",
              title: "Nearby Help",
              desc: "Find nearest blood banks in emergency",
            },
          ].map((f, i) => (
            <div key={i} className="col-md-4 mb-4">
              <div className="card h-100 p-4 rounded-4 shadow-lg border-0">
                <i className={`${f.icon} text-danger display-5 mb-3`} />
                <h5 className="fw-bold">{f.title}</h5>
                <p className="text-secondary">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mb-5">
        <div className="card rounded-4 shadow-lg border-0">
          <div className="card-body p-4">
            <h4 className="fw-bold text-danger text-center">How It Works</h4>
            <div className="row text-center mt-4">
              {[
                "Create an account",
                "Donate or request blood",
                "Organization verifies the transaction",
                "Stock gets updated in real-time",
              ].map((step, i) => (
                <div key={i} className="col-6 col-md-3 mb-3">
                  <div className="p-3">
                    <span className="badge bg-danger rounded-pill px-3 py-2 fs-6">
                      {i + 1}
                    </span>
                    <p className="mt-2 fw-semibold">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Impact Section */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h3 className="fw-bold text-danger mb-4">Our Impact</h3>
          <div className="row">
            {[
              { num: "50K+", label: "Donors" },
              { num: "25K+", label: "Blood Requests Fulfilled" },
              { num: "1K+", label: "Hospitals & Orgs" },
            ].map((stat, i) => (
              <div key={i} className="col-md-4 mb-3">
                <h2 className="fw-bold text-danger">{stat.num}</h2>
                <p className="text-secondary">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2025 BloodBank — Save Lives Together ❤️</p>
      </footer>
    </div>
  );
}
