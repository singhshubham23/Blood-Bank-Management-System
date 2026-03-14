import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function TransactionHistory() {
  const { user } = useContext(AuthContext);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtering States
  const [filterGroup, setFilterGroup] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchText, setSearchText] = useState("");

  // Refs for PDF Generation
  const receiptRefs = useRef({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/transactions/user/${user._id || user.id}`)
      .then((res) => {
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setTxs(sorted);
      })
      .catch(() => alert("Failed to load transactions"))
      .finally(() => setLoading(false));
  }, [user]);

  // PDF Generation Logic
  const downloadPDF = async (txId) => {
    const element = receiptRefs.current[txId];
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a5");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${txId.substring(0, 6)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  // Filter Logic
  const filteredTxs = txs.filter((t) => {
    const isDonation = t.type === "IN" || t.type === "DONATION";
    const actualType = isDonation ? "DONATION" : "REQUEST";

    const matchesGroup = filterGroup ? t.bloodGroup === filterGroup : true;
    const matchesType = filterType ? actualType === filterType : true;

    // Search by Org Name or ID
    const searchTarget = (t.organizationName || t._id).toLowerCase();
    const matchesSearch = searchText ? searchTarget.includes(searchText.toLowerCase()) : true;

    return matchesGroup && matchesType && matchesSearch;
  });

  if (!user) return <h4 className="text-center mt-5">Please Login ❗</h4>;

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-2xl mb-4 text-center text-danger fw-bold">
        <i className="bi bi-clock-history me-2"></i>My Transaction History
      </h2>

      {/* Filters + Search bar */}
      <div className="row g-3 mb-4 p-3 rounded shadow-sm bg-light">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Search by ID or Org..."
            className="form-control"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">All Blood Groups</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="DONATION">DONATION (IN)</option>
            <option value="REQUEST">REQUEST (OUT)</option>
          </select>
        </div>
      </div>

      {filteredTxs.length === 0 ? (
        <div className="alert alert-warning text-center">
          <i className="bi bi-info-circle me-2"></i>No matching transactions found.
        </div>
      ) : (
        <div className="row g-4">
          {filteredTxs.map((t) => (
            <div key={t._id} className="col-12 col-md-6 col-lg-4">
              <div
                className="card shadow-sm border-0 h-100 position-relative"
                ref={(el) => (receiptRefs.current[t._id] = el)}
              >
                {/* PDF Content Area */}
                <div className="card-body p-4 bg-white rounded">
                  <div className="text-center mb-3 pb-2 border-bottom">
                    <h4 className="fw-bold text-danger mb-0">BloodBank</h4>
                    <small className="text-muted">Official Transaction Receipt</small>
                  </div>

                  <h5 className="card-title text-primary d-flex justify-content-between align-items-center">
                    <span>
                      {t.type === "IN" || t.type === "DONATION" ? "💉 DONATION" : "🩸 REQUEST"}
                    </span>
                    <span className="badge bg-danger rounded-pill fs-6 px-3">{t.bloodGroup}</span>
                  </h5>

                  <div className="mt-3">
                    <p className="card-text mb-1">
                      <strong>Units Transferred:</strong> {t.units}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Date:</strong>{" "}
                      {t.timestamp || t.createdAt
                        ? new Date(t.timestamp || t.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                    <p className="card-text mb-1">
                      <strong>Facility:</strong> {t.organizationName || "Central Blood Bank"}
                    </p>
                    <p className="card-text mb-1 small text-muted">
                      <strong>Tx ID:</strong> {t._id}
                    </p>
                  </div>
                </div>

                {/* Download PDF Button (Outside the core receipt styling slightly) */}
                <div className="card-footer bg-light border-0 text-center py-3">
                  <button
                    onClick={() => downloadPDF(t._id)}
                    className="btn btn-outline-danger btn-sm fw-semibold w-100"
                  >
                    <i className="bi bi-file-earmark-pdf-fill me-2"></i>Download PDF Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
