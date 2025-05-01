import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaDollarSign,
  FaBoxOpen,
  FaBoxes,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../components/Pagination';
import MoveSalesToLog from '../components/MoveSalesToLog';

import { BASE_URL } from '../config';

import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

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

//Custom Modal/Dialog Component
const Modal = ({ open, onClose, handleUpdate, children }) => {
  if (!open) return null;
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-6 rounded shadow-md'>
        {children}

        <button
          onClick={onClose}
          className='mt-4 mr-2 bg-red-500 text-white px-3 py-1 rounded'
        >
          Close
        </button>
        <button
          onClick={handleUpdate}
          className='mt-4 bg-blue-600 text-white px-3 py-1 rounded '
        >
          Update
        </button>
      </div>
    </div>
  );
};

const Pharmacy = () => {
  const movedItems = useSelector((state) => state.inventory.movedItems);
  const [drugs, setDrugs] = useState([]);
  const [drugSummary, setDrugSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [updatePage, setUpdatePage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [minLevel, setMinLevel] = useState(0);
  const [expireNotifyDuration, setExpireNotifyDuration] = useState(0);

  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [pharmacySaleTotal, setPharmacySaleTotal] = useState(0);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlySales();
    } else {
      fetchYearlySales();
    }
    fetchPharmacySaleTotal();
    fetchData();
    fetchDrugsSummary();
  }, [selectedYear, selectedMonth, category, currentPage, limit, summaryType]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    let baseUrl = `${BASE_URL}/pharmacy?page=${currentPage}&limit=${limit}`;

    // if (user.role === 'receptionist') {
    //   baseUrl += '&category=sunglasses,frame, glass';
    // } else if (user.role === 'pharmacist' || user.role === 'admin') {
    //   baseUrl += '&category=drug';
    // }
    if (category) {
      baseUrl += `&category=${category}`;
    }

    try {
      const res = await fetch(baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      setDrugs(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmacySaleTotal = async () => {
    try {
      const response = await fetch(`${BASE_URL}/pharmacyTotal`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setPharmacySaleTotal(data.totalSalesAmount);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMonthlySales = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/sales/${selectedYear}/${selectedMonth}?category=${category}`,
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

  const fetchYearlySales = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/sales/${selectedYear}?category=${category}`,
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

  const fetchDrugsSummary = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/drugs-summary?category=${category}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch drugs summary');
      }

      const data = await response.json();
      setDrugSummary(data);
    } catch (err) {
      console.error('Error fetching drugs summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingAssignment(record._id);
    setMinLevel(record.minLevel);
    setExpireNotifyDuration(record.expireNotifyDuration);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/pharmacy/${editingAssignment}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            minLevel,
            expireNotifyDuration,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to update doctor assignment';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      fetchData();
      fetchDrugsSummary();
      setShowEditModal(false);
    } catch (err) {
      console.error('Error assigning doctor:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (drugId) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      try {
        const response = await fetch(`${BASE_URL}/pharmacy/${drugId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // Refresh the page or fetch updated data
          fetchData();
          fetchDrugsSummary();
          toast.success('Product deleted successfully');
        } else {
          let errorMessage = 'Failed to delete the drug.';

          // Attempt to extract the error message from the server response
          try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
          } catch (jsonError) {
            errorMessage = (await response.text()) || errorMessage;
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error('Error during deletion:', err.message);

        // Show error toast with the extracted error message
        toast.error(
          err.message ||
            'An unexpected error occurred while deleting the product.'
        );
      }
    }
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
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
          label: 'Pharmacy-Sales',
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='text-2xl font-semibold text-blue-600'>
          <svg
            className='animate-spin h-8 w-8 mr-3 inline-block'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen bg-gray-100'>
        <div className='text-2xl text-red-600 flex items-center'>
          <FaExclamationTriangle className='mr-3' />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen '>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl'>Pharmacy</h2>
        <div className='mt-10'>
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaDollarSign />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total Available Value
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugSummary.totalSalePrice}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaBoxOpen className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total Items
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugSummary.length}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-green-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-green-500 rounded-md p-3'>
                        <FaBoxes className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total Quantity
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugSummary.totalQuantity}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-yellow-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-yellow-500 rounded-md p-3'>
                        <FaExclamationTriangle className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Low Stock Items
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {drugSummary.lowQuantityCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='bg-yellow-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaDollarSign className='h-6 w-6 text-white' />
                      </div>
                      <div className='ml-5 w-0 flex-1'>
                        <dl>
                          <dt className='text-sm font-medium text-gray-500 truncate'>
                            Total Sale Amount
                          </dt>
                          <dd className='text-lg font-medium text-gray-900'>
                            {pharmacySaleTotal}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='overflow-x-auto rounded-lg shadow-md'>
              <div className='flex flex-row items-center justify-end p-4'>
                <label htmlFor='category' className='sr-only'>
                  Category
                </label>
                <div>
                  <select
                    id='category'
                    name='category'
                    value={category}
                    onChange={handleCategoryChange}
                    className='block w-64 width-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                  >
                    <option value=''>All Categories</option>
                    <option value='drug'>Drug</option>
                    <option value='sunglasses'>sunglasses</option>
                    <option value='glass'>Glass</option>
                    <option value='frame'>Frame</option>
                  </select>
                </div>
              </div>
              <table className='w-full text-sm text-left text-gray-500'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Name
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Manufacturer
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Min-Level
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Expire-Duration
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Category
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Expiry-Date
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Sale-price
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Quantity
                    </th>

                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 font-bold tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {drugs.map((drug, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition duration-150 ease-in-out'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {drug.name}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.manufacturer}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.minLevel}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.expireNotifyDuration}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.category}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.expiryDate?.split('T')[0]}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.salePrice}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {drug.quantity}
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {
                          <span
                            className={`text-xs font-medium ${
                              drug.quantity === 0
                                ? 'text-red-500'
                                : drug.quantity <= drug.minLevel
                                ? 'text-yellow-500'
                                : 'text-green-500'
                            }`}
                          >
                            {drug.quantity === 0
                              ? 'Out of quantity'
                              : drug.quantity <= drug.minLevel
                              ? 'Low'
                              : 'Available'}
                          </span>
                        }
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => handleEdit(drug)}
                          className='font-medium text-blue-600 hover:text-blue-700'
                        >
                          <FaEdit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(drug._id)}
                          className='font-medium text-red-600 hover:text-red-700'
                        >
                          <FaTrash className='w-4 h-4' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Pagination
          totalItems={drugs.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
      </div>

      {/* Edit Assignment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          // resetForm();
        }}
        handleUpdate={handleUpdate}
      >
        <h3 className='text-lg font-bold text-center'>Edit Record</h3>
        <label className='block mt-2'>Min-Level</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={minLevel}
          min={0}
          max={100}
          onChange={(e) => setMinLevel(e.target.value)}
        />
        <label className='block mt-2'>Expire-Duration-Days</label>
        <input
          type='number'
          className='border px-3 py-1 rounded w-full'
          value={expireNotifyDuration}
          min={0}
          onChange={(e) => setExpireNotifyDuration(e.target.value)}
        />
        {error && <p className='text-red-600'>{error}</p>}
      </Modal>

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
                  } Summary for ${category || 'All Categories'}`,
                },
              },
            }}
          />
        </div>
      </div>

      <MoveSalesToLog onTransferSuccess={fetchPharmacySaleTotal} />
    </div>
  );
};

export default Pharmacy;
