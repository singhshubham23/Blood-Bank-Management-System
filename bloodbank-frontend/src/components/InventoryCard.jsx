import React from "react";

export default function InventoryCard({ group, units }) {
  return (
    <div
      className="w-full sm:w-44 md:w-48 lg:w-52 
      bg-linear-to-br from-red-600 via-red-500 to-red-400
      text-white rounded-2xl shadow-lg p-6
      flex flex-col items-center justify-center gap-2
      transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
    >
      <div className="text-xl font-semibold tracking-wide">{group}</div>

      <div className="text-4xl md:text-5xl font-bold drop-shadow-md">
        {units}
      </div>

      <span className="text-sm opacity-90">Units Available</span>
    </div>
  );
}
