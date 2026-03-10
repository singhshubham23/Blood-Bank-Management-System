// OrgTransactions.jsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { ReceiptCutoff } from "react-bootstrap-icons";

export default function OrgTransactions() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    api.get("/organisation/transactions")
      .then(res => setTxs(res.data.transactions));
  }, []);

  return (
    <div className="container py-4" style={{ background: "#fffaf7", minHeight: "100vh" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <ReceiptCutoff size={28} className="text-primary" />
        <h3 className="fw-bold text-primary">Transaction History</h3>
      </div>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-bordered table-striped align-middle">
          <thead className="table-primary">
            <tr>
              <th>Type</th>
              <th>Blood Group</th>
              <th>Units</th>
              <th>User</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(t => (
              <tr key={t._id}>
                <td>{t.type}</td>
                <td className="text-danger fw-bold">{t.bloodGroup}</td>
                <td>{t.units}</td>
                <td>{t.user?.name}</td>
                <td>{new Date(t.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
