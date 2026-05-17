import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DigitalCard from "../components/DigitalCard";


export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <div className="container py-5">

      {/* Page Header */}
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-danger">Dashboard</h2>
        <p className="text-muted">
          View your digital donor card and create blood requests easily.
        </p>
      </div>

      <div className="row g-4 justify-content-center">
        {/* Digital Card */}
        <div className="col-lg-8 col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3 text-center">Your Card</h5>
              <DigitalCard user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}