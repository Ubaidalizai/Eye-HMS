import React from 'react';

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
          <label className="block mb-2 text-sm font-medium">Age:</label>
          <input
            type="Number"
            name="age"
            value={patientData.age}
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
          <label className="block mb-2 text-sm font-medium">Patient ID:</label>
          <input
            type="text"
            name="patientID"
            value={patientData.patientID}
            onChange={handlePatientChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Patient Gender:
          </label>
          <select
            name="patientGender"
            value={patientData.patientGender}
            onChange={handlePatientChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option> {/* Default empty option */}
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">
            Insurance Information:
          </label>
          <input
            type="text"
            name="insuranceContact"
            value={patientData.insuranceContact}
            onChange={handlePatientChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          {isEditing ? 'Update Patient' : 'Register Patient'}{' '}
          {/* Dynamically change button text */}
        </button>
      </form>
    </>
  );
}
