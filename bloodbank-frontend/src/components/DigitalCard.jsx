import React, { useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DigitalCard() {
  const { user } = useContext(AuthContext);
  const cardRef = useRef();

  // checking user
  useEffect(() => {
  console.log("🔥 DigitalCard → User from AuthContext:", user);
}, [user]);

  if (!user) return <p className="text-center py-5">Loading profile...</p>;

  const label = "text-uppercase fw-semibold mb-1 opacity-75 small";
  const value = "fw-bold fs-5";

  const downloadPDF = async () => {
    const element = cardRef.current;
    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("portrait", "px", [430, 600]);
    pdf.addImage(imgData, "PNG", 0, 0, 430, 600);
    pdf.save("Digital_Blood_Donor_Card.pdf");
  };

  return (
    <div className="container d-flex justify-content-center my-5">
      <div style={{ maxWidth: "430px", width: "100%" }}>

        {/* ---- CARD ---- */}
        <div
          ref={cardRef}
          className="card shadow-lg rounded-4 border-0 text-white p-4"
          style={{
            background: "linear-gradient(135deg, #c31432, #240b36)",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold">Digital Donor Card</h4>
            <span
              className={`badge bg-light fs-6 fw-bold ${
                user.bloodGroup ? "text-danger" : "text-secondary"
              }`}
            >
              {user.bloodGroup || "Unknown"}
            </span>
          </div>

          {/* Field Component */}
          <div className="mb-2">
            <p className={label}>Name</p>
            <p className={value}>{user.name || "Not Provided"}</p>
          </div>

          <div className="mb-2">
            <p className={label}>Donor ID</p>
            <p className={value}>{user.uniqueId || "Not Provided"}</p>
          </div>

          <div className="mb-2">
            <p className={label}>Phone</p>
            <p className={value}>{user.phone || "Not Provided"}</p>
          </div>

          <div className="mb-2">
            <p className={label}>Location</p>
            <p className={value}>{user.location || "Not Provided"}</p>
          </div>

          <p className="text-center mt-2 small opacity-75">
            “One unit free for our users.”
          </p>
          <p className="text-center mt-2 small opacity-75">
            “Donate blood, save lives ❤️”
          </p>
        </div>

        {/* ---- DOWNLOAD BUTTON ---- */}
        <button
          onClick={downloadPDF}
          className="btn btn-danger w-100 mt-3 fw-semibold"
        >
          Download as PDF
        </button>
      </div>
    </div>
  );
}
