import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  HiPlus,
  HiSearch,
  HiPencil,
  HiTrash,
  HiDocumentAdd,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi';
import { FaPlus } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:4000/api/v1/patient';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    contact: '',
    patientID: '',
    patientGender: '',
    insuranceContact: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, currentPage]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}?fieldName=name&searchTerm=${searchTerm}`,
        {
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data.data.results);
      setTotalPages(Math.ceil(data.data.total / patientsPerPage));
    } catch (error) {
      toast.error('Failed to fetch patients', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = currentPatient ? 'PATCH' : 'POST';
      const url = currentPatient
        ? `${API_BASE_URL}/${currentPatient._id}`
        : API_BASE_URL;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to save patient');

      toast.success(
        `Patient ${currentPatient ? 'updated' : 'added'} successfully!`,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      toast.error('Failed to save patient', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setFormData(patient);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to delete patient');
        toast.success('Patient deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        fetchPatients();
      } catch (error) {
        toast.error('Failed to delete patient', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className='max-w-6xl z-1 mx-auto p-6 bg-gradient-to-r to-indigo-50 rounded-lg'>
      <ToastContainer />

      <h2 className='font-semibold text-xl '> Patient List</h2>

      <div className='border sm:rounded-lg mt-10'>
        <div className='mb-6 flex justify-between items-center'>
          <div className='flex items-center justify-center z-0'>
            <HiSearch className=' translate-x-7 text-gray-400' size={20} />
            <input
              type='text'
              placeholder='Search patients...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
            />
          </div>
          <button
            onClick={() => {
              setCurrentPatient(null);
              setFormData({
                name: '',
                age: '',
                contact: '',
                patientID: '',
                patientGender: '',
                insuranceContact: '',
              });
              setIsModalOpen(true);
            }}
            className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-6 focus:ring-2 focus:ring-offset-2  focus:ring-indigo-500'
          >
            <FaPlus className='mr-2' /> Add Patient
          </button>
        </div>

        <div className='overflow-x-auto bg-white rounded-lg shadow'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'>
              <tr className='flex items-center justify-between'>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Name
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Age
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Contact
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Patient ID
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Gender
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Insurance
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider'
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {patients.map((patient) => (
                <tr
                  key={patient._id}
                  className='hover:bg-indigo-50 transition-colors duration-150'
                >
                  <td className='py-4 px-4'>{patient.name}</td>
                  <td className='py-4 px-4'>{patient.age}</td>
                  <td className='py-4 px-4'>{patient.contact}</td>
                  <td className='py-4 px-4'>{patient.patientID}</td>
                  <td className='py-4 px-4'>{patient.patientGender}</td>
                  <td className='py-4 px-4'>{patient.insuranceContact}</td>
                  <td className='py-4 px-4'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEdit(patient)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <HiPencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <HiTrash size={20} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/patients/${patient.name}/prescriptions`)
                        }
                        className='text-green-600 hover:text-green-800'
                      >
                        <HiDocumentAdd size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className='mt-4 flex justify-between items-center'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400'
        >
          <HiChevronLeft />
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400'
        >
          <HiChevronRight />
        </button>
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-900'>
          <div className='bg-white p-6 rounded-lg w-96 max-w-md z-60'>
            <h2 className='text-2xl font-bold mb-4 text-indigo-800'>
              {currentPatient ? 'Edit Patient' : 'Add New Patient'}
              {currentPatient ? 'Edit Patient' : 'Add New Patient'}
            </h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Name'
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <input
                type='number'
                name='age'
                value={formData.age}
                onChange={handleInputChange}
                placeholder='Age'
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <input
                type='tel'
                name='contact'
                value={formData.contact}
                onChange={handleInputChange}
                placeholder='Contact'
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <input
                type='text'
                name='patientID'
                value={formData.patientID}
                onChange={handleInputChange}
                placeholder='Patient ID'
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                required
              />
              <select
                name='patientGender'
                value={formData.patientGender}
                onChange={handleInputChange}
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
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
                className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
              />
              <div className='flex justify-end space-x-2'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition'
                >
                  {currentPatient ? 'Update' : 'Add'} Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
