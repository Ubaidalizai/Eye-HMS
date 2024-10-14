import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HiMenu } from "react-icons/hi";

const API_BASE_URL = "http://localhost:4000/api/v1/patient";

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // For toggling dropdown
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    contact: "",
    patientID: "",
    patientGender: "",
    insuranceContact: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}?searchTerm=${searchTerm}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      const data = await response.json();
      setPatients(data.data.results);
    } catch (error) {
      toast.error("Failed to fetch patients");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentPatient ? "PATCH" : "POST";
      const url = currentPatient
        ? `${API_BASE_URL}/${currentPatient._id}`
        : API_BASE_URL;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to save patient");

      toast.success(
        `Patient ${currentPatient ? "updated" : "added"} successfully!`
      );
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      toast.error("Failed to save patient");
    }
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setFormData(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to delete patient");
        toast.success("Patient deleted successfully!");
        fetchPatients();
      } catch (error) {
        toast.error("Failed to delete patient");
      }
    }
  };
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id); // Toggle the dropdown for specific patient
  };

  return (
    <div className='max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
      <ToastContainer />
      <h1 className='text-3xl font-bold text-center mb-8 text-gray-800'>
        Patient Management
      </h1>

      <div className='mb-4 flex justify-between items-center'>
        <input
          type='text'
          placeholder='Search patients...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='p-2 border border-gray-300 rounded w-64'
        />
        <button
          onClick={() => {
            setCurrentPatient(null);
            setFormData({
              name: "",
              age: "",
              contact: "",
              patientID: "",
              patientGender: "",
              insuranceContact: "",
            });
            setIsModalOpen(true);
          }}
          className='px-4 py-2  text-[#555] rounded  transition'
        >
          Add New Patient
        </button>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white'>
          <thead className='bg-gray-100'>
            <tr>
              <th className='py-2 px-4 border-b'>Name</th>
              <th className='py-2 px-4 border-b'>Age</th>
              <th className='py-2 px-4 border-b'>Contact</th>
              <th className='py-2 px-4 border-b'>Patient ID</th>
              <th className='py-2 px-4 border-b'>Gender</th>
              <th className='py-2 px-4 border-b'>Insurance</th>
              <th className='py-2 px-4 border-b'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className='hover:bg-gray-50'>
                <td className='py-2 px-4 border-b'>{patient.name}</td>
                <td className='py-2 px-4 border-b'>{patient.age}</td>
                <td className='py-2 px-4 border-b'>{patient.contact}</td>
                <td className='py-2 px-4 border-b'>{patient.patientID}</td>
                <td className='py-2 px-4 border-b'>{patient.patientGender}</td>
                <td className='py-2 px-4 border-b'>
                  {patient.insuranceContact}
                </td>
                <td className='py-2 px-4 border-b relative'>
                  {/* Menu Icon */}
                  <button
                    onClick={() => toggleDropdown(patient._id)}
                    className='focus:outline-none bg-slate-200 hover:bg-slate-100 '
                  >
                    <HiMenu
                      size={24}
                      className='text-gray-600 hover:text-gray-800 transition-colors duration-200'
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === patient._id && (
                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10'>
                      <button
                        onClick={() => handleEdit(patient)}
                        className='block px-4 py-2 text-left bg-slate-200  text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors duration-150'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className='block px-4 py-2 text-left text-gray-700 bg-slate-200 hover:bg-gray-50 hover:text-red-600 transition-colors duration-150'
                      >
                        Delete
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/patients/${patient.name}/prescriptions`)
                        }
                        className='block px-4 py-2 text-left text-gray-700 bg-slate-200 hover:bg-gray-50 hover:text-green-600 transition-colors duration-150'
                      >
                        Add Prescription
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
          <div className='bg-white p-6 rounded-lg w-96'>
            <h2 className='text-2xl font-bold mb-4'>
              {currentPatient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <form onSubmit={handleSubmit}>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Name'
                className='w-full p-2 mb-2 border rounded'
                required
              />
              <input
                type='number'
                name='age'
                value={formData.age}
                onChange={handleInputChange}
                placeholder='Age'
                className='w-full p-2 mb-2 border rounded'
                required
              />
              <input
                type='tel'
                name='contact'
                value={formData.contact}
                onChange={handleInputChange}
                placeholder='Contact'
                className='w-full p-2 mb-2 border rounded'
                required
              />
              <input
                type='text'
                name='patientID'
                value={formData.patientID}
                onChange={handleInputChange}
                placeholder='Patient ID'
                className='w-full p-2 mb-2 border rounded'
                required
              />
              <select
                name='patientGender'
                value={formData.patientGender}
                onChange={handleInputChange}
                className='w-full p-2 mb-2 border rounded'
                required
              >
                <option value=''>Select Gender</option>
                <option value='Male'>Male</option>
                <option value='Female'>Female</option>
                <option value='Other'>Other</option>
              </select>
              <input
                type='text'
                name='insuranceContact'
                value={formData.insuranceContact}
                onChange={handleInputChange}
                placeholder='Insurance Contact'
                className='w-full p-2 mb-4 border rounded'
              />
              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 bg-gray-300 text-gray-800 rounded mr-2 hover:bg-gray-400 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition'
                >
                  {currentPatient ? "Update" : "Add"} Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
