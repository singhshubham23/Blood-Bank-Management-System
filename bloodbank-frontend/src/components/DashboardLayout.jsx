import { Outlet } from "react-router-dom";
import CommandPanel from "./CommandPanel";
import MobileDock from "./MobileDock";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <CommandPanel />
      <main className="dashboard-content">
        <Outlet />
      </main>
      <MobileDock />
    </div>
  );
}
