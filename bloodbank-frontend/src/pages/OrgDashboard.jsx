import React from "react";
import OrgPanel from "../components/OrgPanel";

export default function OrgDashboard() {
  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h2 className="text-center text-danger">Organization Dashboard</h2>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <OrgPanel />
        </div>
      </div>
    </div>
  );
}
