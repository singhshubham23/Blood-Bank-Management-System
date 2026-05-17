import React from "react";
import RequestForm from "../components/RequestForm";

export default function CreateRequest() {
  return (
    <div className="container py-5">
      <div className="mb-4 text-center">
        <h2 className="fw-bold text-danger">Create Blood Request</h2>
        <p className="text-muted">
          Submit a request for blood donation or specify an emergency need.
        </p>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <RequestForm />
        </div>
      </div>
    </div>
  );
}
