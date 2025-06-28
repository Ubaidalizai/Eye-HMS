import React from "react";

export default function BillingForm({
  billingData,
  handleBillingChange,
  handleBillingSubmit,
}) {
  return (
    <form
      className="p-4 bg-white rounded-lg shadow"
      onSubmit={handleBillingSubmit}
    >
      <h2 className="text-xl font-semibold mb-4">Billing Information</h2>
      <label className="block mb-2">Select Service:</label>
      <select
        name="service"
        value={billingData.service}
        onChange={handleBillingChange}
        required
        className="w-full p-2 border border-gray-300 rounded mb-4"
      >
        <option value="">Select...</option>
        <option value="consultation">Consultation</option>
        <option value="treatment">Treatment</option>
        <option value="medication">Medication</option>
      </select>
      <label className="block mb-2">Amount:</label>
      <input
        type="number"
        name="amount"
        value={billingData.amount}
        onChange={handleBillingChange}
        required
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <label className="block mb-2">Payment Method:</label>
      <input
        type="text"
        value="Cash"
        readOnly
        className="w-full p-2 border border-gray-300 rounded mb-4 bg-gray-200"
      />
      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Process Payment
      </button>
    </form>
  );
}
