import React from "react";

export default function PatientForm({
  patientData,
  handlePatientChange,
  handlePatientSubmit,
  isEditing, // New prop to check if we are editing an existing patient
}) {
  return (
    <>
      <form
        className="mb-8 p-6 grid  md:grid-cols-2 gap-x-4 bg-white rounded-lg  max-w-md mx-auto"
        onSubmit={handlePatientSubmit}
      >
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={patientData.name}
            onChange={handlePatientChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Date of Birth:
          </label>
          <input
            type="date"
            name="dob"
            value={patientData.dob}
            onChange={handlePatientChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Contact Details:
          </label>
          <input
            type="text"
            name="contact"
            value={patientData.contact}
            onChange={handlePatientChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Insurance Information:
          </label>
          <input
            type="text"
            name="insurance"
            value={patientData.insurance}
            onChange={handlePatientChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {isEditing ? "Update Patient" : "Register Patient"}{" "}
          {/* Dynamically change button text */}
        </button>
      </form>
    </>
  );
}
