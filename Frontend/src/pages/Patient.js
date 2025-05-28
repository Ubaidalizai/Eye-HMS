import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bar } from 'react-chartjs-2';
import { HiSearch } from 'react-icons/hi';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

import { FaPlus, FaRegEdit, FaTrash } from 'react-icons/fa';
import Pagination from '../components/Pagination';
import { BASE_URL } from '../config';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const API_BASE_URL = `${BASE_URL}/patient`;

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    age: '',
    contact: '',
    patientID: '',
    date: '',
    patientGender: '',
    insuranceContact: '',
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyPatients();
    } else {
      fetchYearlyPatients();
    }
    fetchPatients(); // Fetch paginated Patients for the list
  }, [
    currentPage,
    selectedMonth,
    selectedYear,
    summaryType,
    searchTerm,
    limit,
  ]);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}?fieldName=name&searchTerm=${searchTerm}&page=${currentPage}&limit=${limit}`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setPatients(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.data.total / limit));
    } catch (error) {
      toast.error(`${error}`, {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMonthlyPatients = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/patient/${selectedYear}/${selectedMonth}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.data); // Assuming the backend returns a "summary" field
    } catch (err) {
      console.log(err);
    }
  };

  const fetchYearlyPatients = async () => {
    try {
      const response = await fetch(`${BASE_URL}/patient/${selectedYear}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.data); // Assuming the backend returns a "summary" field
    } catch (err) {
      console.log(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAddButtonDisabled(true);

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

      if (!response.ok) {
        // Attempt to parse error message from backend
        let errorMessage = 'Failed to add Patient';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text(); // Fallback to plain text
        }
        throw new Error(errorMessage);
      }

      const result = await response.json(); // Parse the response if needed
      toast.success(
        `Patient ${currentPatient ? 'updated' : 'added'} successfully!`
      );

      setIsModalOpen(false); // Close the modal
      fetchPatients(); // Refresh the patients list
    } catch (error) {
      console.error('Error saving patient:', error.message);
      toast.error(error.message);
    } finally {
      setIsAddButtonDisabled(false); // Re-enable the button
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

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const getBarChartData = () => {
    let labels, data;

    if (summaryType === 'yearly') {
      labels = monthLabels; // Month names for the x-axis
      data = summary || Array(12).fill(0); // Use data from the API or zeros
    } else {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`); // Days of the month
      data = summary || Array(30).fill(0); // Use data from the API or zeros
    }

    return {
      labels,
      datasets: [
        {
          label: 'Patients',
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className='max-w-6xl mx-auto px-4 sm:px-6 py-6'>
      <ToastContainer />

      <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6'>
        Patient List
      </h2>

      <div className='bg-white border rounded-lg shadow-sm mb-6'>
        {/* Search and Add Patient Section */}
        <div className='p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4'>
          <div className='w-full sm:w-auto'>
            <label
              htmlFor='patient-search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Search Patients
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <HiSearch className='text-gray-400' size={20} />
              </div>
              <input
                id='patient-search'
                type='text'
                placeholder='Search by name...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 h-10 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='flex items-end'>
            <button
              onClick={() => {
                setCurrentPatient(null);
                setFormData({
                  name: '',
                  fatherName: '',
                  age: '',
                  contact: '',
                  patientID: '',
                  patientGender: '',
                  insuranceContact: '',
                  date: '',
                });
                setIsModalOpen(true);
              }}
              className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
            >
              <FaPlus className='mr-2' /> Add Patient
            </button>
          </div>
        </div>

        {/* Table Section with Horizontal Scrolling */}
        <div className='border-t border-gray-200'>
          {isLoading ? (
            <div className='flex justify-center items-center py-10'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
              <p className='ml-3 text-gray-600'>Loading...</p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <div className='inline-block min-w-full align-middle'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Name
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Father Name
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Age
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Contact
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Patient ID
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Gender
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Date
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Insurance
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-center'
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <tr
                          key={patient._id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {patient?.name}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.fatherName}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.age}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.contact}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.patientID}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.patientGender}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.date?.split('T')[0]}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {patient?.insuranceContact}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                            <div className='flex justify-center space-x-3'>
                              <button
                                onClick={() => handleEdit(patient)}
                                className='text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors'
                                aria-label='Edit patient'
                              >
                                <FaRegEdit className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDelete(patient._id)}
                                className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                                aria-label='Delete patient'
                              >
                                <FaTrash className='w-4 h-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No patients found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Responsive indicator - only visible on small screens */}
              <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4 pb-2'>
                <p>Swipe horizontally to see more data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='mb-6'>
        <Pagination
          totalItems={patients.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-0'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden'>
            <div className='flex justify-between items-center border-b px-6 py-4'>
              <h2 className='text-lg sm:text-xl font-semibold text-gray-800'>
                {currentPatient ? 'Edit Patient' : 'Add Patient'}
              </h2>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md'
              >
                <span className='sr-only'>Close</span>
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className='px-6 py-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Name
                  </label>
                  <input
                    id='name'
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='Enter patient name'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='fatherName'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Father Name
                  </label>
                  <input
                    id='fatherName'
                    type='text'
                    name='fatherName'
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder='Enter father name'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='age'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Age
                  </label>
                  <input
                    id='age'
                    type='number'
                    name='age'
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder='Enter age'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    required
                    min='0'
                  />
                </div>

                <div>
                  <label
                    htmlFor='contact'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Contact
                  </label>
                  <input
                    id='contact'
                    type='tel'
                    name='contact'
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder='Enter contact number'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='patientID'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Patient ID
                  </label>
                  <input
                    id='patientID'
                    type='text'
                    name='patientID'
                    value={formData.patientID}
                    onChange={handleInputChange}
                    placeholder='Enter patient ID'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor='patientGender'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Gender
                  </label>
                  <select
                    id='patientGender'
                    name='patientGender'
                    value={formData.patientGender}
                    onChange={handleInputChange}
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                    required
                  >
                    <option value=''>Select Gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor='date'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Date
                  </label>
                  <input
                    id='date'
                    type='date'
                    name='date'
                    value={formData.date}
                    onChange={handleInputChange}
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                  />
                </div>

                <div>
                  <label
                    htmlFor='insuranceContact'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Insurance Contact
                  </label>
                  <input
                    id='insuranceContact'
                    type='text'
                    name='insuranceContact'
                    value={formData.insuranceContact}
                    onChange={handleInputChange}
                    placeholder='Enter insurance contact'
                    className='w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm'
                  />
                </div>
              </div>
            </form>

            <div className='px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 border-t'>
              <button
                type='button'
                onClick={() => setIsModalOpen(false)}
                className='mt-3 sm:mt-0 inline-flex justify-center items-center px-4 py-2 h-10 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                className={`inline-flex justify-center items-center px-4 py-2 h-10 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isAddButtonDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                }`}
                disabled={isAddButtonDisabled}
              >
                {isAddButtonDisabled
                  ? 'Processing...'
                  : currentPatient
                  ? 'Update Patient'
                  : 'Add Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='mt-10 flex flex-col gap-6'>
        <div className='flex gap-4'>
          {/* Summary Type Selector */}
          <div className='w-full sm:w-1/5'>
            <select
              id='summaryType'
              className='w-full rounded-sm border border-gray-300 bg-white py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
              onChange={handleSummaryTypeChange}
              value={summaryType}
            >
              <option value='monthly'>Monthly Summary</option>
              <option value='yearly'>Yearly Summary</option>
            </select>
          </div>

          {/* Month Selector */}
          {summaryType === 'monthly' && (
            <div className='w-full sm:w-1/5'>
              <select
                id='month'
                className='w-full rounded-sm border border-gray-300 bg-white py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
                onChange={handleMonthChange}
                value={selectedMonth}
              >
                {monthLabels.map((label, index) => (
                  <option key={index} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Year Selector */}
          {summaryType === 'yearly' && (
            <div className='w-full sm:w-1/5'>
              <input
                id='year'
                className='w-full rounded-sm border border-gray-300 bg-white py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
                type='number'
                value={selectedYear}
                onChange={handleYearChange}
                min='2000'
                max={new Date().getFullYear()}
              />
            </div>
          )}
        </div>

        {/* Chart Display */}
        <div className='mt-6 p-6 bg-white rounded-sm border border-gray-200'>
          <h2 className='mb-4 text-lg font-semibold text-gray-800'>
            {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
          </h2>
          <Bar
            data={getBarChartData()}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `${
                    summaryType.charAt(0).toUpperCase() + summaryType.slice(1)
                  } Summary for ${0}`,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
