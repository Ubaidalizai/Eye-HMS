import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import PatientForm from "../components/PatientForm";
import ReportGenerator from "../components/ReportGenerator";
import PrescriptionModal from "../components/PrescriptionModal";

const API_BASE_URL = "http://localhost:4000/api/v1/patient";

export default function Patient() {
  const navigate = useNavigate();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientData, setPatientData] = useState({
    name: "",
    age: "",
    contact: "",
    patientID: "",
    patientGender: "",
    insuranceContact: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      fetchFilteredPatients();
    } else {
      fetchPatients();
    }
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      const response = await fetch(API_BASE_URL, { credentials: "include" });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPatients(data.data.results);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to fetch patients.");
    }
  };

  const fetchFilteredPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?searchTerm=${searchTerm}`, {
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setPatients(data.data.results);
    } catch (error) {
      console.error("Error fetching filtered patients:", error);
      toast.error("Failed to fetch filtered patients.");
    }
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (
      !patientData.name ||
      !patientData.age ||
      !patientData.contact ||
      !patientData.patientID ||
      !patientData.patientGender
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const method = isEditing ? "PATCH" : "POST";
      const url = isEditing ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      toast.success(`Patient ${isEditing ? "updated" : "added"} successfully!`);
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
      toast.error("Failed to save patient.");
    }
  };

  const handleAddPrescription = (patient) => {
    setCurrentPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async (prescriptionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${currentPatient._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptions: [...currentPatient.prescriptions, prescriptionData],
        }),
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      toast.success("Prescription added successfully!");
      setShowPrescriptionModal(false);
      fetchPatients();
    } catch (error) {
      console.error("Error adding prescription:", error);
      toast.error("Failed to add prescription.");
    }
  };

  const handleEdit = (patient) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setPatientData(patient);
    setEditingId(patient._id);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      toast.success("Patient deleted successfully!");
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error("Failed to delete patient.");
    }
  };

  return (
    <div className='container'>
      <Toaster />
      <h1 className='title'>Patient Management</h1>
      <div className='search-add'>
        <input
          type='text'
          placeholder='Search patients...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='search-input'
        />
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
          }}
          className='add-button'
        >
          Add Patient
        </button>
      </div>
      {patients.length > 0 ? (
        <table className='patient-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Insurance</th>
              <th>Contact</th>
              <th>ID</th>
              <th>Gender</th>
              <th>Prescriptions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.name}</td>
                <td>{patient.age}</td>
                <td>{patient.insuranceContact}</td>
                <td>{patient.contact}</td>
                <td>{patient.patientID}</td>
                <td>{patient.patientGender}</td>
                <td>
                  {patient.prescriptions.map((prescription, index) => (
                    <div
                      key={index}
                      className='prescription-link'
                      onClick={() => navigate(`/prescription/${patient._id}`)}
                    >
                      {prescription}
                    </div>
                  ))}
                </td>
                <td>
                  <div className='action-buttons'>
                    <button
                      onClick={() => handleEdit(patient)}
                      className='edit-button'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(patient._id)}
                      className='delete-button'
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleAddPrescription(patient)}
                      className='add-prescription-button'
                    >
                      Add Prescription
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className='no-patients'>No patients registered.</p>
      )}
      <ReportGenerator />

      {isModalOpen && (
        <div className='modal'>
          <div className='modal-content'>
            <h2>{isEditing ? "Edit Patient" : "Add Patient"}</h2>
            <PatientForm
              patientData={patientData}
              handlePatientChange={handlePatientChange}
              handlePatientSubmit={handlePatientSubmit}
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className='close-button'
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <PrescriptionModal
          show={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          onSave={handleSavePrescription}
          patient={currentPatient}
        />
      )}

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }
        .search-add {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .search-input {
          padding: 8px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .add-button,
        .edit-button,
        .delete-button,
        .add-prescription-button {
          padding: 8px 16px;
          font-size: 16px;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .add-button {
          background-color: #4caf50;
        }
        .edit-button {
          background-color: #2196f3;
        }
        .delete-button {
          background-color: #f44336;
        }
        .add-prescription-button {
          background-color: #ff9800;
        }
        .patient-table {
          width: 100%;
          border-collapse: collapse;
        }
        .patient-table th,
        .patient-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .patient-table th {
          background-color: #f2f2f2;
        }
        .action-buttons {
          display: flex;
          gap: 5px;
        }
        .prescription-link {
          color: #2196f3;
          text-decoration: underline;
          cursor: pointer;
        }
        .no-patients {
          text-align: center;
          color: #666;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 4px;
          max-width: 500px;
          width: 100%;
        }
        .close-button {
          margin-top: 10px;
          padding: 8px 16px;
          background-color: #ccc;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
