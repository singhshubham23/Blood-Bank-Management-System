import React from "react";
import DigitalCard from "../components/DigitalCard";

export default function DigitalCardPage() {
  return (
    <div className="container py-5">
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-danger">Digital Card</h2>
        <p className="text-muted">
          Your personalized blood donor card with all essential details.
        </p>
      </div>

      <div className="d-flex justify-content-center">
        <div
          className="card shadow-sm border-0 p-4"
          style={{ maxWidth: "400px", width: "100%" }}
        >
          <DigitalCard />
        </div>
      </div>
    </div>
  );
}
