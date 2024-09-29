import React from "react";
import { toast } from "react-hot-toast";

export default function ReportGenerator() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Generate Reports
      </h2>
      <label className="block mb-2">Select Report Type:</label>
      <select className="w-full p-2 border border-gray-300 rounded mb-4">
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>
      <button
        onClick={() => toast.info("Report generated!")}
        className="w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Generate Report
      </button>
    </div>
  );
}
