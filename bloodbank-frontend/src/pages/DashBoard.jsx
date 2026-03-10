import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DigitalCard from "../components/DigitalCard";
import RequestForm from "../components/RequestForm";

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

      {/* Responsive Grid */}
      <div className="row g-4">

        {/* Digital Card */}
        <div className="col-lg-6 col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-primary mb-3">Your Card</h5>
              <DigitalCard user={user} />
            </div>
          </div>
        </div>

        {/* Request Form */}
        <div className="col-lg-6 col-md-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title text-success mb-3">Create Request</h5>
              <RequestForm />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}