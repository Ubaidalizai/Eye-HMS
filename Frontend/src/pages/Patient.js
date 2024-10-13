/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import PatientForm from '../components/PatientForm';
import ReportGenerator from '../components/ReportGenerator';
import PatientList from '../components/PatientList';
import { useNavigate } from 'react-router-dom';
import PrescriptionModal from '../components/PrescriptionModal';

export default function Patient() {
  const navigate = useNavigate();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState();
  const [patients, setPatients] = useState([]);
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    contact: '',
    patientID: '',
    patientGender: '',
    insuranceContact: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const API_BASE_URL = 'http://localhost:4000/api/v1/patient';

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          credentials: 'include', // Send cookies
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setPatients(data.data.results);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patients.');
      }
    };

    fetchPatients();
  }, []);

  // Fetch patients based on search term
  useEffect(() => {
    const fetchFilteredPatients = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}?searchTerm=${searchTerm}`,
          {
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch patients: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setPatients(data.data.results); // Assuming the API returns the filtered patients
      } catch (error) {
        console.error('Error fetching filtered patients:', error);
        toast.error('Failed to fetch filtered patients.');
      }
    };

    // Fetch patients if the filter is not empty
    if (searchTerm) {
      fetchFilteredPatients();
    } else {
      setPatients([]); // Clear the list if filter is empty
    }
  }, [searchTerm]); // Dependency array includes 'filter' to trigger when it changes

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    console.log(patientData);
    if (
      !patientData.name ||
      !patientData.age ||
      !patientData.contact ||
      !patientData.patientID ||
      !patientData.patientGender
    ) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const newPatient = { ...patientData, prescriptions: [] };

    try {
      if (isEditing) {
        await fetch(`${API_BASE_URL}/${editingId}`, {
          credentials: 'include',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatient),
        });
        toast.success('Patient updated successfully!');
      } else {
        await fetch(API_BASE_URL, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPatient),
        });
        toast.success('Patient added successfully!');
      }
      const updatedPatients = await fetch(API_BASE_URL);
      const data = await updatedPatients.json();
      setPatients(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error('Failed to save patient.');
    }
  };

  const handleAddPrescription = (patient) => {
    setCurrentPatient(patient);
    setShowPrescriptionModal(true);
  };

  const handleSavePrescription = async (prescriptionData) => {
    try {
      await fetch(`${API_BASE_URL}/${currentPatient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescriptions: [...currentPatient.prescriptions, prescriptionData],
        }),
      });
      toast.success('Prescription added successfully!');
      setShowPrescriptionModal(false);

      const updatedPatients = await fetch(API_BASE_URL);
      const data = await updatedPatients.json();
      setPatients(data);
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('Failed to add prescription.');
    }
  };

  const handleEdit = (patient) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setPatientData(patient);
    setEditingId(patient._id);
  };

  const handleDelete = async (id) => {
    console.log(id);
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      });
      toast.success('Patient deleted successfully!');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient.');
    }
  };

  const columns = React.useMemo(
    () => [
      { Header: 'Patient Name', accessor: 'name' },
      { Header: 'Age', accessor: 'age' },
      { Header: 'Insurance', accessor: 'insuranceContact' },
      { Header: 'Contact', accessor: 'contact' },
      { Header: 'Unique ID', accessor: 'patientID' },
      { Header: 'Gender', accessor: 'patientGender' },
      {
        Header: 'Prescriptions',
        accessor: 'prescriptions',
        Cell: ({ row }) => (
          <ul>
            {row.original.prescriptions.map((prescription, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={() => navigate(`/prescription/${row.original.id}`)}
                  style={{ color: '#2196F3', textDecoration: 'underline' }}
                >
                  {prescription}
                </a>
              </li>
            ))}
          </ul>
        ),
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
            <button
              onClick={() => handleAddPrescription(row.original)}
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Toaster />
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Patient Management
      </h1>
      <input
        type="text"
        placeholder="Filter by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        {isEditing ? 'Edit Patient' : 'Add Patient'}
      </button>
      {patients.length > 0 ? (
        <PatientList patients={patients} columns={columns} />
      ) : (
        <p className="text-center text-gray-500">No patients registered.</p>
      )}
      <ReportGenerator />

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isEditing ? 'Edit Patient' : 'Add Patient'}
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
