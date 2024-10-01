/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import PatientForm from "../components/PatientForm";
import ReportGenerator from "../components/ReportGenerator";
import PatientList from "../components/PatientList";
import { useNavigate } from "react-router-dom";
import PrescriptionModal from "../components/PrescriptionModal";

export default function Patient() {
  const navigate = useNavigate();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false); // For prescription modal
  const [currentPatient, setCurrentPatient] = useState(null); // Patient to add prescription to

  const [filter, setFilter] = useState("");
  const [isInitialMount, setIsInitialMount] = useState(true);
  const handleAddPrescription = (patient) => {
    setCurrentPatient(patient); // Set current patient
    setShowPrescriptionModal(true); // Open prescription modal
  };

  const handleSavePrescription = (prescriptionData) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => {
        if (patient.id === currentPatient.id) {
          return {
            ...patient,
            prescriptions: [
              ...patient.prescriptions,
              `Prescription ${
                patient.prescriptions.length + 1
              }: ${prescriptionData}`,
            ], // Append prescription
          };
        }
        return patient;
      })
    );
    setShowPrescriptionModal(false); // Close modal after saving
    toast.success("Prescription added successfully!");
  };

  // const columns = React.useMemo(
  //   () => [
  //     { Header: "Patient Name", accessor: "name" },
  //     { Header: "Date of Birth", accessor: "dob" },
  //     { Header: "Insurance", accessor: "insurance" },
  //     { Header: "Contact", accessor: "contact" },
  //     {
  //       Header: "Prescriptions",
  //       accessor: "prescriptions",
  //       Cell: ({ row }) => (
  //         <ul>
  //           {row.original.prescriptions.map((prescription, index) => (
  //             <li key={index}>
  //               <a
  //                 href="#"
  //                 onClick={() => navigate(`/prescription/${row.original.id}`)}
  //                 style={{ color: "#2196F3", textDecoration: "underline" }}
  //               >
  //                 {prescription}
  //               </a>
  //             </li>
  //           ))}
  //         </ul>
  //       ),
  //     },
  //     {
  //       Header: "Actions",
  //       accessor: "actions",
  //       Cell: ({ row }) => (
  //         <div className="flex space-x-2">
  //           <button
  //             onClick={() => handleEdit(row.original)}
  //             className="text-blue-600 hover:underline"
  //           >
  //             Edit
  //           </button>
  //           <button
  //             onClick={() => handleDelete(row.original.id)}
  //             className="text-red-600 hover:underline"
  //           >
  //             Delete
  //           </button>
  //         </div>
  //       ),
  //     },
  //   ],
  //   [navigate]
  // );
  const columns = React.useMemo(
    () => [
      { Header: "Patient Name", accessor: "name" },
      { Header: "Date of Birth", accessor: "dob" },
      { Header: "Insurance", accessor: "insurance" },
      { Header: "Contact", accessor: "contact" },
      {
        Header: "Prescriptions",
        accessor: "prescriptions",
        Cell: ({ row }) => (
          <ul>
            {row.original.prescriptions.map((prescription, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={() => navigate(`/prescription/${row.original.id}`)}
                  style={{ color: "#2196F3", textDecoration: "underline" }}
                >
                  {prescription}
                </a>
              </li>
            ))}
          </ul>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
            <button
              onClick={() => handleAddPrescription(row.original)} // New button to add prescription
              className="text-green-600 hover:underline"
            >
              Add Prescription
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const [patientData, setPatientData] = useState({
    name: "",
    dob: "",
    contact: "",
    insurance: "",
  });

  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [storageData, SetStoragedar] = useState([]);
  // Load patients from local storage when the component mounts
  // Load patients from local storage when the component mounts
  useEffect(() => {
    const storedPatients = JSON.parse(localStorage.getItem("patients")) || [];
    setPatients(storedPatients);
    setIsInitialMount(false); // Mark initial mount as complete
  }, []);

  // Update local storage whenever the patients state changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount) {
      localStorage.setItem("patients", JSON.stringify(patients));
      console.log("Updated local storage with patients:", patients);
    }
  }, [patients, isInitialMount]); // Add isInitialMount to the dependency array

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    if (!patientData.name || !patientData.dob || !patientData.contact) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const newPatient = {
      id: uuidv4(),
      ...patientData,
      prescriptions: [],
    };

    if (isEditing) {
      setPatients((prevPatients) =>
        prevPatients.map((patient) =>
          patient.id === editingId
            ? {
                ...patientData,
                id: editingId,
                prescriptions: patient.prescriptions,
              }
            : patient
        )
      );
      toast.success("Patient updated successfully!");
      setIsEditing(false);
      setEditingId(null);
    } else {
      setPatients((prevPatients) => [...prevPatients, newPatient]);
      toast.success("Patient registered successfully!");
    }

    setPatientData({ name: "", dob: "", contact: "", insurance: "" });
    setIsModalOpen(false);
  };

  const handleEdit = (patient) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setPatientData(patient);
    setEditingId(patient.id);
  };

  const handleDelete = (id) => {
    setPatients((prevPatients) =>
      prevPatients.filter((patient) => patient.id !== id)
    );
    toast.success("Patient deleted successfully!");
  };
  const addPrescription = (patientId) => {
    setPatients((prevPatients) =>
      prevPatients.map((patient) => {
        if (patient.id === patientId) {
          const newPrescription = `Prescription ${
            patient.prescriptions.length + 1
          }`;
          return {
            ...patient,
            prescriptions: [...patient.prescriptions, newPrescription],
          };
        }
        return patient;
      })
    );
    toast.success("Prescription added successfully!");
  };
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Patient Management
      </h1>
      <input
        type="text"
        placeholder="Filter by name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        {isEditing ? "Edit Patient" : "Add Patient"}
      </button>
      {filteredPatients.length > 0 ? (
        <PatientList
          patients={filteredPatients}
          columns={columns}
          handleEdit={handleEdit}
          addPrescription={addPrescription}
        />
      ) : (
        <p className="text-center text-gray-500">No patients registered.</p>
      )}
      <ReportGenerator />

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? "Edit Patient" : "Add Patient"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✖
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

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <PrescriptionModal
          show={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          onSave={handleSavePrescription}
          patient={currentPatient}
        />
      )}
    </div>
  );
}
