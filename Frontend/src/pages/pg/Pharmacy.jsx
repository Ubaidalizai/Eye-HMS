import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  FaDollarSign,
  FaBoxOpen,
  FaBoxes,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../components/Pagination.jsx';
import MoveSalesToLog from '../components/MoveSalesToLog.jsx';

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

// Generate year options from 2022 to current year
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2022; // Starting year for the application
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
};

//Custom Modal/Dialog Component
const Modal = ({ open, onClose, handleUpdate, children }) => {
  if (!open) return null;
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4'>
      <div className='bg-white p-4 sm:p-6 rounded shadow-md w-full max-w-md'>
        {children}

        <div className='flex flex-col sm:flex-row sm:justify-end gap-2 mt-4'>
          <button
            onClick={onClose}
            className='w-full sm:w-auto bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600'
          >
            Close
          </button>
          <button
            onClick={handleUpdate}
            className='w-full sm:w-auto bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700'
          >
            Update
          </button>
        </div>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [minLevel, setMinLevel] = useState(0);
  const [expireNotifyDuration, setExpireNotifyDuration] = useState(0);

  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [pharmacySaleTotal, setPharmacySaleTotal] = useState(0);



  // Debounce search term to prevent excessive API calls and focus loss
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 300); // 300ms delay for faster response than glasses

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlySales();
    } else {
      fetchYearlySales();
    }
    fetchPharmacySaleTotal();
    fetchData();
    fetchDrugsSummary();
  }, [
    selectedYear,
    selectedMonth,
    category,
    currentPage,
    limit,
    summaryType,
    debouncedSearchTerm,
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Set searching state if there's a search term
    if (debouncedSearchTerm) {
      setIsSearching(true);
    }

    let baseUrl = `${BASE_URL}/pharmacy?page=${currentPage}&limit=${limit}&fieldName=name&searchTerm=${debouncedSearchTerm}`;

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
      setIsSearching(false);
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
        `${BASE_URL}/sales/${selectedYear}/${selectedMonth}?category=drug`,
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
        `${BASE_URL}/sales/${selectedYear}?category=drug`,
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
      const response = await fetch(`${BASE_URL}/pharmacy/drugs-summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

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

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    // Refetch data when month changes
    fetchMonthlySales();
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    // Refetch data when year changes
    if (summaryType === 'monthly') {
      fetchMonthlySales();
    } else {
      fetchYearlySales();
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };



  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getBarChartData = () => {
    let labels, data;

    if (summaryType === 'yearly') {
      // For yearly summary, use month labels
      labels = monthLabels;
      data = summary || Array(12).fill(0);
    } else {
      // For monthly summary, dynamically calculate the number of days
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
      labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);

      // If we have data, use it; otherwise create an array of zeros with the correct length
      data = summary || Array(daysInMonth).fill(0);

      // Ensure data length matches the days in month (in case the API returns a fixed array)
      if (data.length !== daysInMonth) {
        // If API returns more data than needed, truncate it
        if (data.length > daysInMonth) {
          data = data.slice(0, daysInMonth);
        }
        // If API returns less data than needed, pad with zeros
        else if (data.length < daysInMonth) {
          data = [...data, ...Array(daysInMonth - data.length).fill(0)];
        }
      }
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
    <div className='min-h-screen p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl mb-4'>Pharmacy</h2>
        <div className='mt-4 sm:mt-6'>
          <div className='bg-white border overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              {/* Responsive grid for summary cards */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
                <div className='bg-blue-100 overflow-hidden shadow rounded-lg'>
                  <div className='px-4 py-5 sm:p-6'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 bg-blue-500 rounded-md p-3'>
                        <FaDollarSign className='h-5 w-5 text-white' />
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
                        <FaBoxOpen className='h-5 w-5 text-white' />
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
                        <FaBoxes className='h-5 w-5 text-white' />
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
                        <FaExclamationTriangle className='h-5 w-5 text-white' />
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
                        <FaDollarSign className='h-5 w-5 text-white' />
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

            {/* Search Section - Moved outside table area */}
            <div className='px-4 py-5 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50'>
              <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
                <div className='w-full lg:w-auto'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Search Pharmacy Inventory
                  </label>
                  <div className='relative group'>
                    <div className='absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none'>
                      <FaSearch className={`text-gray-400 transition-colors group-focus-within:text-blue-500 ${isSearching ? 'animate-pulse' : ''}`} />
                    </div>
                    <input
                      type='text'
                      placeholder='Search drugs by name...'
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className='block w-full lg:w-80 pl-11 pr-12 py-3 text-sm border border-gray-300 rounded-lg bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 hover:shadow-md'
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className='absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors'
                        title='Clear search'
                      >
                        <FaTimes className='h-4 w-4' />
                      </button>
                    )}
                  </div>

                </div>

                {/* Search Results Info */}
                {debouncedSearchTerm && (
                  <div className='flex items-center space-x-4'>
                    {isSearching ? (
                      <div className='flex items-center text-sm text-blue-600'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2'></div>
                        Searching...
                      </div>
                    ) : (
                      <div className='text-sm bg-white px-3 py-2 rounded-lg shadow-sm border'>
                        <span className='text-gray-600'>Found </span>
                        <span className='font-semibold text-gray-900'>{drugs.length}</span>
                        <span className='text-gray-600'> result{drugs.length !== 1 ? 's' : ''} for </span>
                        <span className='font-medium text-blue-600'>"{debouncedSearchTerm}"</span>
                      </div>
                    )}
                    <button
                      onClick={clearSearch}
                      className='text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors px-3 py-1 rounded hover:bg-blue-50'
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive table with horizontal scroll */}
            <div className='border-t border-gray-200'>
              {loading ? (
                <div className='flex justify-center items-center py-10'>
                  <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
                  <p className='ml-3 text-gray-600'>Loading...</p>
                </div>
              ) : (
                <div className='overflow-x-auto rounded-lg shadow-md'>
                  <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Name
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Manufacturer
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Min-Level
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Expire-Duration
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Expiry-Date
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Sale-price
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Quantity
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
                        >
                          Status
                        </th>
                        <th
                          scope='col'
                          className='px-4 py-3 font-bold tracking-wider'
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
                          <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {drug.name}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.manufacturer}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.minLevel}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.expireNotifyDuration} days
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.expiryDate?.split('T')[0]}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.salePrice}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                            {drug.quantity}
                          </td>
                          <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
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
                          <td className='px-4 py-3 whitespace-nowrap'>
                            <div className='flex space-x-2'>
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responsive pagination */}
        <div className='mt-4'>
          <Pagination
            totalItems={drugs.length}
            totalPagesCount={totalPages}
            itemsPerPage={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(limit) => setLimit(limit)}
          />
        </div>
      </div>

      {/* Edit Assignment Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        handleUpdate={handleUpdate}
      >
        <h3 className='text-lg font-bold text-center mb-4'>Edit Record</h3>
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Min-Level
            </label>
            <input
              type='number'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={minLevel}
              min={0}
              max={100}
              onChange={(e) => setMinLevel(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Expire-Duration-Days
            </label>
            <input
              type='number'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={expireNotifyDuration}
              min={0}
              onChange={(e) => setExpireNotifyDuration(e.target.value)}
            />
          </div>
        </div>

        {error && <p className='text-red-600 mt-2'>{error}</p>}
      </Modal>

      {/* Responsive chart section */}
      <div className='mt-6 sm:mt-10'>
        <div className='bg-white rounded-lg border p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            {/* Summary Type Selector */}
            <div className='w-full sm:w-1/3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Summary Type
              </label>
              <select
                id='summaryType'
                className='w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
                onChange={handleSummaryTypeChange}
                value={summaryType}
              >
                <option value='monthly'>Monthly Summary</option>
                <option value='yearly'>Yearly Summary</option>
              </select>
            </div>

            {/* Month Selector */}
            {summaryType === 'monthly' && (
              <div className='w-full sm:w-1/3'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Month
                </label>
                <select
                  id='month'
                  className='w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
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

            {/* Year Selector - Always visible */}
            <div className='w-full sm:w-1/3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Year
              </label>
              <select
                id='year'
                className='w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
                value={selectedYear}
                onChange={handleYearChange}
              >
                {generateYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Display */}
          <div className='mt-4 p-2 sm:p-4 bg-white rounded-md border border-gray-200'>
            <h2 className='mb-4 text-lg font-semibold text-gray-800'>
              {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}{' '}
              Summary
            </h2>
            <div className='h-64 sm:h-96'>
              <Bar
                data={getBarChartData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text:
                        summaryType === 'yearly'
                          ? `Yearly Summary for ${
                              category || 'All Categories'
                            } (${selectedYear})`
                          : `Monthly Summary for ${
                              category || 'All Categories'
                            } (${
                              monthLabels[selectedMonth - 1]
                            } ${selectedYear})`,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive MoveSalesToLog component */}
      <div className='mt-6'>
        <MoveSalesToLog onTransferSuccess={fetchPharmacySaleTotal} />
      </div>
    </div>
  );
};

export default Pharmacy;
