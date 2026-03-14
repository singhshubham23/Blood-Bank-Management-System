import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function AdminInventory() {
  const { user } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    setLoading(true);
    api
      .get("/admin/inventory")
      .then((res) => setRows(res.data || []))
      .catch(() => alert("Failed to load inventory"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== "admin") {
    return <h4 className="text-center text-danger mt-5">Admin Access Required</h4>;
  }

  if (loading) return <h4 className="text-center mt-5">Loading...</h4>;

  const filtered = rows.filter((r) => {
    const name = r.orgId?.name || r.bloodBankName || "Central Blood Bank";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container py-4">
      <h2 className="text-center text-danger fw-bold mb-3">Inventory By Institute</h2>
      <p className="text-center text-muted mb-4">
        Admin view of blood units by institute and blood group.
      </p>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Search institute..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive shadow-sm">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-danger text-center">
            <tr>
              <th>Institute</th>
              <th>Type</th>
              {GROUPS.map((g) => (
                <th key={g}>{g}</th>
              ))}
              <th>Total</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {filtered.length > 0 ? (
              filtered.map((inv) => {
                const name = inv.orgId?.name || inv.bloodBankName || "Central Blood Bank";
                const role = inv.orgId?.role || "central";
                const groups = inv.groups || {};
                const total = GROUPS.reduce((sum, g) => sum + Number(groups[g] || 0), 0);
                return (
                  <tr key={inv._id}>
                    <td className="fw-semibold text-start ps-3">{name}</td>
                    <td>{role}</td>
                    {GROUPS.map((g) => (
                      <td key={g}>{groups[g] ?? 0}</td>
                    ))}
                    <td className="fw-bold">{total}</td>
                    <td>
                      {inv.lastUpdated
                        ? new Date(inv.lastUpdated).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={GROUPS.length + 4} className="text-muted py-3">
                  No inventory records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
