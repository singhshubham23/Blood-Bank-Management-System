import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

export default function Inventory() {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (!user) return;

    const loadInventory = async () => {
      try {
        if (["organisation", "hospital"].includes(user.role)) {
          const res = await api.get("/organisation/inventory");
          setInventory(res.data.inventory);
        } else {
          const res = await api.get("/inventory");
          setInventory(res.data.inventory);
        }
      } catch (err) {
        alert("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    loadInventory();

    const socket = io(import.meta.env.VITE_SOCKET_URL);
    if (["organisation", "hospital"].includes(user.role)) {
      socket.emit("subscribeInventory", { orgId: user._id });
    } else {
      socket.emit("subscribeInventory");
    }

    socket.on("inventory:update", (updatedInv) => {
      setInventory(updatedInv.inventory || updatedInv);
    });

    return () => socket.disconnect();
  }, [user]);

  if (!user) return <h4 className="text-center mt-5">Please Login</h4>;

  if (!["organisation", "hospital"].includes(user.role))
    return <h4 className="text-center mt-5 text-danger">Unauthorized</h4>;

  if (loading || !inventory) return <h4 className="text-center mt-5">Loading...</h4>;

  const groups = inventory.groups || {};
  const totalUnits = Object.values(groups).reduce((sum, v) => sum + v, 0);

  const filtered = Object.entries(groups)
    .filter(([group]) => group.toLowerCase().includes(search.toLowerCase()))
    .sort(([a], [b]) => (sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)));

  return (
    <div className="container py-5">
      <h2 className="text-center text-danger fw-bold mb-4">
        Blood Inventory — {inventory.bloodBankName || "Your Institute"}
      </h2>

      {/* Search + Sort */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <input
          type="text"
          className="form-control shadow-sm"
          placeholder="Search blood group..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "350px" }}
        />
        <select
          className="form-select shadow-sm"
          style={{ maxWidth: "200px" }}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Sort: Z - A</option>
          <option value="asc">Sort: A - Z</option>
        </select>
      </div>

      {/* Total Count Display */}
      <div className="alert alert-light border text-center fw-semibold shadow-sm">
        Total Available Units: <span className="text-danger fw-bold">{totalUnits}</span>
      </div>

      {/* Inventory Cards */}
      <div className="row g-4 mt-3">
        {filtered.map(([group, units]) => (
          <div key={group} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div
              className={`card text-center border-0 shadow-lg p-4 inv-card ${
                units < 5 ? "low-stock" : ""
              }`}
            >
              <h5 className="fw-bold inv-badge">{group}</h5>
              <p className="display-6 fw-bold mb-0">{units}</p>
              <small className="text-muted">Units</small>

              {units < 5 && (
                <span className="badge bg-warning text-dark mt-2">Low Stock</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center mt-5 text-secondary fw-semibold">
          No matching blood groups found.
        </p>
      )}

      <style>{`
        .inv-card {
          transition: all 0.25s ease-in-out;
          border-radius: 15px;
        }
        .inv-card:hover {
          transform: translateY(-6px);
          box-shadow: 0px 10px 20px rgba(220, 0, 0, 0.35);
        }
        .inv-badge {
          background: #dc3545;
          color: #fff;
          border-radius: 50px;
          padding: 4px 10px;
          display: inline-block;
        }
        .low-stock {
          border-left: 6px solid #ffc107 !important;
        }
        @media(max-width: 576px) {
          .inv-card p {
            font-size: 1.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
