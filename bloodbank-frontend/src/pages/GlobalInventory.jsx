import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function GlobalInventory() {
  const { user } = useContext(AuthContext);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get("/inventory/global")
      .then((res) => setInventory(res.data.inventory))
      .catch(() => alert("Failed to load global inventory"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <h4 className="text-center mt-5">Please Login</h4>;
  if (loading || !inventory) return <h4 className="text-center mt-5">Loading...</h4>;

  const groups = inventory.groups || {};
  const totalUnits = Object.values(groups).reduce((sum, v) => sum + Number(v || 0), 0);

  return (
    <div className="container py-5">
      <h2 className="text-center text-danger fw-bold mb-2">Global Blood Inventory</h2>
      <p className="text-center text-muted mb-4">
        Total blood units available across all institutes.
      </p>

      <div className="alert alert-light border text-center fw-semibold shadow-sm">
        Total Available Units: <span className="text-danger fw-bold">{totalUnits}</span>
      </div>

      <div className="row g-4 mt-3">
        {Object.entries(groups).map(([group, units]) => (
          <div key={group} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div className="card text-center border-0 shadow-lg p-4 rounded-4">
              <h5 className="fw-bold text-danger">{group}</h5>
              <p className="display-6 fw-bold mb-0">{units}</p>
              <small className="text-muted">Units</small>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 text-muted small">
        Last Updated: {inventory.lastUpdated ? new Date(inventory.lastUpdated).toLocaleString() : "N/A"}
      </div>
    </div>
  );
}
