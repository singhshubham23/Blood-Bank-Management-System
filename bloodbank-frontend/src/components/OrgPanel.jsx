import React from "react";
import { Link } from "react-router-dom";
import { Building2, Boxes } from "lucide-react";

export default function OrgPanel() {
  return (
    <div
      className="w-full bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-500
      text-white p-6 rounded-2xl shadow-lg border border-white/10
      transition-all duration-300 hover:shadow-2xl"
    >
      <h3 className="text-xl font-bold tracking-wide mb-4">
        Organization Panel
      </h3>

      <ul className="space-y-3">
        <li>
          <Link
            to="/org/dashboard"
            className="flex items-center gap-3 p-3 bg-white/10 rounded-xl
            hover:bg-white/20 transition-all text-sm md:text-base font-medium"
          >
            <Building2 size={20} />
            Org Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/inventory?orgId=me"
            className="flex items-center gap-3 p-3 bg-white/10 rounded-xl
            hover:bg-white/20 transition-all text-sm md:text-base font-medium"
          >
            <Boxes size={20} />
            Organization Inventory
          </Link>
        </li>
      </ul>
    </div>
  );
}
