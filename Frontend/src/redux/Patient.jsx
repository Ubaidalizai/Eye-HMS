import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import PatientForm from "../components/PatientForm.jsx";
import BillingForm from "../components/BillingForm.jsx";
import ReportGenerator from "../components/ReportGenerator.jsx";
import PatientList from "../components/PatientList.jsx";

export default function Patient() {
  const columns = React.useMemo(
    () => [
      { Header: "Patient Name", accessor: "name" },
      { Header: "Age", accessor: "dob" },
      { Header: "Insurance", accessor: "insurance" },
      { Header: "Contact", accessor: "contact" },
    ],
    []
  );

  const [patientData, setPatientData] = useState({
    name: "",
    dob: "",
    contact: "",
    insurance: "",
  });

  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    const newPatient = { id: uuidv4(), ...patientData };
    setPatients([...patients, newPatient]);
    toast.success("Patient registered successfully!");
    setPatientData({ name: "", dob: "", contact: "", insurance: "" });
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Patient Management
      </h1>
      <button
        onClick={toggleModal}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Add Patient
      </button>
      <PatientList patients={patients} columns={columns} />
      <ReportGenerator />

      {/* Patient Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg transform transition-transform duration-300 ease-in-out scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add Patient
              </h2>
              <button
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <PatientForm
              patientData={patientData}
              handlePatientChange={handlePatientChange}
              handlePatientSubmit={handlePatientSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
