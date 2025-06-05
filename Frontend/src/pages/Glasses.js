import { useEffect, useState } from 'react';
import AddGlasses from '../components/AddGlasses';
import {
  FaDollarSign,
  FaBoxOpen,
  FaBoxes,
  FaExclamationTriangle,
  FaEdit,
  FaTrash,
  FaPlus,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from '../components/Pagination';
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

const Glasses = () => {
  const [glasses, setGlasses] = useState([]);
  const [glassesSummary, setGlassesSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState('');
  const [tableCategory, setTableCategory] = useState('');
  const [limit, setLimit] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [minLevel, setMinLevel] = useState(20);
  const [showItemModal, setShowItemModal] = useState(false);

  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    manufacturer: '',
    minLevel: '',
    salePrice: '',
    category: '',
  });

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlySales();
    } else {
      fetchYearlySales();
    }
    fetchData();
    fetchGlassesSummary();
  }, [
    selectedYear,
    selectedMonth,
    category,
    tableCategory,
    currentPage,
    limit,
    summaryType,
  ]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    let baseUrl = `${BASE_URL}/glasses?page=${currentPage}&limit=${limit}`;

    if (tableCategory) {
      baseUrl += `&category=${tableCategory}`;
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
      setGlasses(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const fetchGlassesSummary = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/glasses/summary?category=${category}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch glasses summary');
      }

      const data = await response.json();
      setGlassesSummary(data);
    } catch (err) {
      console.error('Error fetching glasses summary:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setEditingAssignment(record._id);
    setNewProduct({
      name: record.name,
      manufacturer: record.manufacturer,
      minLevel: record.minLevel,
      salePrice: record.salePrice,
      category: record.category,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/glasses/${editingAssignment}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...newProduct,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update item';
        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      fetchData();
      fetchGlassesSummary();
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${BASE_URL}/glasses/${itemId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // Refresh the page or fetch updated data
          fetchData();
          fetchGlassesSummary();
          toast.success('Item deleted successfully');
        } else {
          let errorMessage = 'Failed to delete the item.';

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
          err.message || 'An unexpected error occurred while deleting the item.'
        );
      }
    }
  };

  const handleCategoryChange = (e) => {
    setTableCategory(e.target.value);
    setCurrentPage(1);
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
          label: 'Glasses-Sales',
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
    <div className='min-h-screen p-4 sm:p-6'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='font-semibold text-xl mb-4'>Glasses</h2>
        <div className='mt-4 sm:mt-6'>
          <div className='bg-white border overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              {/* Responsive grid for summary cards */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
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
                            {glassesSummary.totalSalePrice}
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
                            {glassesSummary.length}
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
                            {glassesSummary.totalStock}
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
                            {glassesSummary.lowStockCount}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showItemModal && (
              <AddGlasses
                handleUpdatePage={fetchData}
                onClose={() => setShowItemModal(false)}
              />
            )}

            <div className='overflow-x-auto rounded-lg shadow-md'>
              {/* Responsive filter and add button */}
              <div className='flex flex-col sm:flex-row justify-between p-4 gap-4'>
                <div className='w-full sm:w-auto'>
                  <select
                    id='category'
                    name='category'
                    value={tableCategory}
                    onChange={handleCategoryChange}
                    className='block w-full text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                  >
                    <option value=''>All Categories</option>
                    <option value='sunglasses'>sunglasses</option>
                    <option value='glass'>Glass</option>
                    <option value='frame'>Frame</option>
                  </select>
                </div>
                <div className='w-full sm:w-auto'>
                  <button
                    onClick={() => setShowItemModal(true)}
                    className='inline-flex items-center justify-center w-full px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    <FaPlus className='mr-2' />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Responsive table with horizontal scroll */}
              <div className='overflow-x-auto'>
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
                        Category
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 font-bold tracking-wider'
                      >
                        Date
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-3 font-bold tracking-wider'
                      >
                        Purchase-price
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
                    {glasses.map((glass, index) => (
                      <tr
                        key={index}
                        className='hover:bg-gray-50 transition duration-150 ease-in-out'
                      >
                        <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {glass.name}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.manufacturer}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.minLevel}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.category}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.createdAt.split('T')[0]}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.purchasePrice}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.salePrice}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {glass.quantity}
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-600'>
                          {
                            <span
                              className={`text-xs font-medium ${
                                glass.quantity === 0
                                  ? 'text-red-500'
                                  : glass.quantity <= glass.minLevel
                                  ? 'text-yellow-500'
                                  : 'text-green-500'
                              }`}
                            >
                              {glass.quantity === 0
                                ? 'Out of stock'
                                : glass.quantity <= glass.minLevel
                                ? 'Low'
                                : 'Available'}
                            </span>
                          }
                        </td>
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleEdit(glass)}
                              className='font-medium text-blue-600 hover:text-blue-700'
                            >
                              <FaEdit className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => handleDelete(glass._id)}
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
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className='mt-4'>
          <Pagination
            totalItems={glasses.length}
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
              Name
            </label>
            <input
              type='text'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Manufacturer
            </label>
            <input
              type='text'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={newProduct.manufacturer}
              onChange={(e) =>
                setNewProduct({ ...newProduct, manufacturer: e.target.value })
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Sale Price
            </label>
            <input
              type='number'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={newProduct.salePrice}
              min={0}
              onChange={(e) =>
                setNewProduct({ ...newProduct, salePrice: e.target.value })
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Min-Level
            </label>
            <input
              type='number'
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={newProduct.minLevel}
              min={1}
              onChange={(e) =>
                setNewProduct({ ...newProduct, minLevel: e.target.value })
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700'>
              Category
            </label>
            <select
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            >
              <option value='sunglasses'>Sunglasses</option>
              <option value='glass'>Glass</option>
              <option value='frame'>Frame</option>
            </select>
          </div>
        </div>

        {error && <p className='text-red-600 mt-2'>{error}</p>}
      </Modal>

      {/* Responsive chart section */}
      <div className='mt-6 sm:mt-10'>
        <div className='bg-white rounded-lg border p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            {/* Filter Selector */}
            <div className='w-full sm:w-1/4'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Category
              </label>
              <select
                id='filter'
                className='w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500'
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              >
                <option value=''>All</option>
                <option value='sunglasses'>Sunglasses</option>
                <option value='glass'>Glass</option>
                <option value='frame'>Frame</option>
              </select>
            </div>

            {/* Summary Type Selector */}
            <div className='w-full sm:w-1/4'>
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
              <div className='w-full sm:w-1/4'>
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
            <div className='w-full sm:w-1/4'>
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
              {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Sales
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
    </div>
  );
};

export default Glasses;
