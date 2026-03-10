// import React, { useEffect, useState, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";

// export default function Transactions() {
//   const { user } = useContext(AuthContext);
//   const [tx, setTx] = useState([]);

//   useEffect(() => {
//     if (!user || user.role !== "admin") return;

//     const load = async () => {
//       try {
//         const res = await api.get("/admin/transactions");
//         setTx(res.data || []);
//       } catch (err) {
//         alert("Failed to load transactions");
//       }
//     };

//     load();
//   }, [user]);

//   if (!user || user.role !== "admin")
//     return <h4 className="text-center mt-5 text-danger">Admin Only ❗</h4>;

//   return (
//     <div className="container py-4">
//       <h2 className="text-center text-primary mb-4">All Transactions</h2>

//       <div className="table-responsive">
//         <table className="table table-striped table-bordered">
//           <thead className="table-dark">
//             <tr>
//               <th>User</th>
//               <th>Blood Group</th>
//               <th>Units</th>
//               <th>Type</th>
//               <th>Date</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tx.map((t) => (
//               <tr key={t._id}>
//                 <td>{t.user?.name}</td>
//                 <td>{t.bloodGroup}</td>
//                 <td>{t.units}</td>
//                 <td>{t.type}</td>
//                 <td>{new Date(t.createdAt).toLocaleString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useContext, useRef } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function Transactions() {
  const { user } = useContext(AuthContext);
  const [tx, setTx] = useState([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchText, setSearchText] = useState("");

  // Refs for PDF Generation
  const receiptRefs = useRef({});

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const load = async () => {
      try {
        const res = await api.get("/admin/transactions");
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setTx(sorted);
      } catch (err) {
        alert("Failed to load transactions");
      }
    };

    load();
  }, [user]);

  if (!user || user.role !== "admin")
    return <h4 className="text-center mt-5 text-danger">Admin Only ❗</h4>;

  // PDF Generation Logic
  const downloadPDF = async (txId, rowElement) => {
    if (!rowElement) return;

    // Quick cloned element logic to print it as a neat separate card
    // since Admin Transactions are displayed in a table row
    const cardHTML = `
      <div style="padding: 30px; background: white; width: 400px; font-family: sans-serif; border: 1px solid #ccc;">
        <h2 style="color: #dc3545; text-align: center; margin-bottom: 5px;">BloodBank</h2>
        <p style="text-align: center; color: #6c757d; margin-top: 0;">Official Transaction Receipt</p>
        <hr style="margin-bottom: 20px;">
        <p><strong>Transaction ID:</strong> ${txId}</p>
        <p><strong>Date:</strong> ${rowElement.getAttribute('data-date')}</p>
        <p><strong>User:</strong> ${rowElement.getAttribute('data-user')}</p>
        <p><strong>Blood Group:</strong> ${rowElement.getAttribute('data-group')}</p>
        <p><strong>Units:</strong> ${rowElement.getAttribute('data-units')}</p>
        <p><strong>Type:</strong> ${rowElement.getAttribute('data-type')}</p>
      </div>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cardHTML;
    document.body.appendChild(tempDiv);

    try {
      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a5");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${txId.substring(0, 6)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  // Filter logic (UPDATED)
  const filteredTx = tx.filter((t) => {
    const isDonation = t.type === "IN" || t.type === "DONATION";
    const isRequest = t.type === "OUT" || t.type === "REQUEST";

    const actualType = isDonation ? "DONATION" : isRequest ? "REQUEST" : "";

    const matchesGroup = filterGroup ? t.bloodGroup === filterGroup : true;
    const matchesType = filterType ? actualType === filterType : true;
    const matchesSearch = searchText
      ? t.user?.name.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesGroup && matchesType && matchesSearch;
  });


  return (
    <div className="container py-4">
      <h2 className="text-center text-danger fw-bold mb-3">
        <i className="bi bi-cash-stack me-2"></i>Transaction Records
      </h2>

      {/* Filters + Search */}
      <div className="row g-3 mb-3 p-3 rounded shadow-sm bg-light">
        <div className="col-md-4">
          <input
            type="text"
            placeholder="Search by user name..."
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
            <option value="">Filter by Blood Group</option>
            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Filter by Type</option>
            <option value="DONATION">DONATION</option>
            <option value="REQUEST">REQUEST</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-danger text-center">
            <tr>
              <th>User</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>Type</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {filteredTx.length > 0 ? (
              filteredTx.map((t) => (
                <tr
                  key={t._id}
                  ref={(el) => (receiptRefs.current[t._id] = el)}
                  data-user={t.user?.name || "Unknown"}
                  data-group={t.bloodGroup}
                  data-units={t.units}
                  data-type={t.type === "IN" || t.type === "DONATION" ? "DONATION" : "REQUEST"}
                  data-date={t.createdAt || t.date ? new Date(t.createdAt || t.date).toLocaleString() : "N/A"}
                >
                  <td className="fw-semibold">{t.user?.name || "Unknown"}</td>

                  <td>
                    <span className="badge bg-primary">{t.bloodGroup}</span>
                  </td>

                  <td>{t.units}</td>

                  <td>
                    <span
                      className={`badge ${t.type === "IN" || t.type === "DONATION"
                          ? "bg-success"
                          : "bg-warning text-dark"
                        }`}
                    >
                      {t.type === "IN" || t.type === "DONATION"
                        ? "DONATION"
                        : "REQUEST"}
                    </span>
                  </td>

                  <td>
                    {t.createdAt || t.date
                      ? new Date(t.createdAt || t.date).toLocaleString()
                      : "N/A"}
                  </td>

                  <td>
                    <button
                      onClick={() => downloadPDF(t._id, receiptRefs.current[t._id])}
                      className="btn btn-outline-danger btn-sm"
                      title="Download PDF"
                    >
                      <i className="bi bi-download"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-muted py-3">
                  <i className="bi bi-info-circle me-2"></i>
                  No Transactions Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Section */}
      <div className="alert alert-info mt-4 text-center shadow-sm">
        <i className="bi bi-exclamation-circle me-2"></i>
        Track all donation & request activities made through the system.
      </div>
    </div>
  );
}
