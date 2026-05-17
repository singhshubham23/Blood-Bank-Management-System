import { Outlet } from "react-router-dom";
import CommandPanel from "./CommandPanel";
import MobileDock from "./MobileDock";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      {/* Left 30% — Command Panel (hidden on mobile via CSS) */}
      <CommandPanel />

      <main className="dashboard-content">
        <Outlet />
      </main>

      <MobileDock />
    </div>
  );
}
