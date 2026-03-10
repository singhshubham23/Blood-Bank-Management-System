// OrgInventory.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { PencilSquare } from "react-bootstrap-icons";

export default function OrgInventory() {
  const [inventory, setInventory] = useState(null);
  const [changes, setChanges] = useState({});

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const res = await api.get("/organisation/inventory");
    setInventory(res.data.inventory);
  };

  const updateUnits = (group, val) => {
    setChanges(prev => ({ ...prev, [group]: Number(val) }));
  };

  const applyUpdate = async () => {
    await api.patch("/organisation/inventory", { updates: changes });
    setChanges({});
    loadInventory();
  };

  if (!inventory) return "Loading...";

  return (
    <div className="container py-4" style={{ background: "#fef7f7", minHeight: "100vh" }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <PencilSquare className="text-danger" size={28} />
        <h3 className="fw-bold text-danger">Manage Inventory</h3>
      </div>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-hover table-striped align-middle">
          <thead className="table-danger">
            <tr>
              <th>Blood Group</th>
              <th>Current Units</th>
              <th>Update Units</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(inventory.groups).map((g) => (
              <tr key={g}>
                <td className="fw-bold text-danger">{g}</td>
                <td>{inventory.groups[g]}</td>
                <td>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="± units"
                    onChange={(e) => updateUnits(g, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="btn btn-success mt-3 px-4 fw-semibold" onClick={applyUpdate}>
        Apply Update
      </button>
    </div>
  );
}
