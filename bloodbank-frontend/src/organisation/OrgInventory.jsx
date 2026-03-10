// OrgInventory.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";

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
    <div className="container mt-4">
      <h3>Manage Inventory</h3>
      <table className="table table-bordered mt-4">
        <thead>
          <tr>
            <th>Blood Group</th>
            <th>Current Units</th>
            <th>Modify</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(inventory.groups).map((g) => (
            <tr key={g}>
              <td>{g}</td>
              <td>{inventory.groups[g]}</td>
              <td>
                <input
                  type="number"
                  className="form-control"
                  placeholder="±units"
                  onChange={(e) => updateUnits(g, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-success" onClick={applyUpdate}>
        Apply Update
      </button>
    </div>
  );
}
