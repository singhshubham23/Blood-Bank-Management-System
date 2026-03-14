import React, { useContext, useRef, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DigitalCard() {
  const { user } = useContext(AuthContext);
  const cardRef = useRef();
  const [totalDonated, setTotalDonated] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [loadError, setLoadError] = useState("");

  // checking user
  useEffect(() => {
    console.log("DigitalCard -> User from AuthContext:", user);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoadingTotals(false);
      return;
    }
    if (user.role && user.role !== "user") {
      setLoadingTotals(false);
      return;
    }
    setLoadingTotals(true);
    setLoadError("");
    api
      .get(`/transactions/user/${user._id || user.id}`)
      .then((res) => {
        const txs = res.data || [];
        const donated = txs.reduce((sum, t) => {
          const isDonation = t.type === "IN" || t.type === "DONATION";
          return isDonation ? sum + Number(t.units || 0) : sum;
        }, 0);
        setTotalDonated(donated);
      })
      .catch(() => {
        setLoadError("Failed to load donation totals.");
      })
      .finally(() => setLoadingTotals(false));
  }, [user]);

  if (!user) return <p className="text-center py-5">Loading profile...</p>;
  if (user.role && user.role !== "user")
    return (
      <div className="text-center py-5">
        <h5 className="text-danger fw-bold mb-2">Users Only</h5>
        <p className="text-muted mb-0">
          Digital donor cards are available only for donor users.
        </p>
      </div>
    );

  const label = "text-uppercase fw-semibold mb-1 opacity-75 small";
  const value = "fw-bold fs-5";
  const eligibleForCard = totalDonated >= 5;
  const freeUnitsEarned = Math.floor(totalDonated / 5);

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
        {loadingTotals ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : loadError ? (
          <div className="alert alert-danger text-center">{loadError}</div>
        ) : !eligibleForCard ? (
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold text-danger mb-2">Digital Donor Card Locked</h5>
            <p className="mb-2">
              Total donated: <strong>{totalDonated}</strong> unit{totalDonated === 1 ? "" : "s"}
            </p>
            <p className="mb-0 text-muted">
              Donate {5 - totalDonated} more unit{5 - totalDonated === 1 ? "" : "s"} to unlock your
              donor card and earn 1 free unit.
            </p>
          </div>
        ) : (
          <>
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

              <div className="mb-2">
                <p className={label}>Total Donated</p>
                <p className={value}>
                  {totalDonated} unit{totalDonated === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mb-2">
                <p className={label}>Free Units Earned</p>
                <p className={value}>
                  {freeUnitsEarned} unit{freeUnitsEarned === 1 ? "" : "s"}
                </p>
              </div>

              <p className="text-center mt-2 small opacity-75">
                One free unit for every 5 units donated.
              </p>
              <p className="text-center mt-2 small opacity-75">Donate blood, save lives.</p>
            </div>

            {/* ---- DOWNLOAD BUTTON ---- */}
            <button onClick={downloadPDF} className="btn btn-danger w-100 mt-3 fw-semibold">
              Download as PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}
