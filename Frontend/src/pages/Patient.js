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

      setIsModalOpen(false); // Close the modal
      fetchPatients(); // Refresh the patients list
    } catch (error) {
      console.error('Error saving patient:', error.message);
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
    <div className='max-w-6xl z-1 mx-auto bg-gradient-to-r to-indigo-50 rounded-lg'>
      <ToastContainer />

      <h2 className='font-semibold text-xl '> Patient List</h2>

      <div className='border sm:rounded-lg mt-10'>
        <div className='mb-6 pt-6 flex justify-between items-center'>
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
                fatherName: '',
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

        <div className='overflow-x-auto bg-white'>
          <table className='w-full text-sm text-left text-gray-500'>
            <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
              <tr>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Name
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Father Name
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Age
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Contact
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Patient ID
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Gender
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Date
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Insurance
                </th>
                <th scope='col' className='px-5 py-3 font-bold tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {patients.map((patient) => (
                <tr key={patient._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-900'>
                    {patient?.name}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-900'>
                    {patient?.fatherName}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.age}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.contact}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.patientID}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.patientGender}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.date?.split('T')[0]}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                    {patient?.insuranceContact}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEdit(patient)}
                        className='text-indigo-600 hover:text-indigo-900'
                      >
                        <FaRegEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(patient._id)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <FaTrash className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        totalItems={patients.length}
        totalPagesCount={totalPages}
        itemsPerPage={limit}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
        onLimitChange={(limit) => setLimit(limit)}
      />

      {isModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-900'>
          <div className='bg-white p-6 rounded-lg w-96 max-w-md z-60'>
            <h2 className='text-xl font-bold mb-4 text-gray-600'>
              {currentPatient ? 'Edit Patient' : 'Add Patient'}
            </h2>
            <form onSubmit={handleSubmit} className=''>
              <div className='grid grid-cols-2 gap-5'>
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
                  type='text'
                  name='fatherName'
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder='Father Name'
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
                  min='0'
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
                  type='date'
                  name='date'
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder='Insurance Contact'
                  className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
                <input
                  type='text'
                  name='insuranceContact'
                  value={formData.insuranceContact}
                  onChange={handleInputChange}
                  placeholder='Insurance Contact'
                  className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                />
              </div>
              <div className='flex justify-end space-x-2 mt-5'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='inline-flex items-center px-5 py-2 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={`inline-flex items-center px-5 py-2 border border-transparent text-sm mr-0 font-medium rounded-md text-white ${
                    isAddButtonDisabled
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  disabled={isAddButtonDisabled} // Disable the button
                >
                  {currentPatient ? 'Update' : 'Add'} Patient
                </button>
              </div>
            </form>
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
