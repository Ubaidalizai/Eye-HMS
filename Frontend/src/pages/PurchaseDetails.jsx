import { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import AddPurchaseDetails from '../components/AddPurchaseDetails.jsx';
import AuthContext from '../AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import { HiSearch } from 'react-icons/hi';
import Pagination from '../components/Pagination.jsx';
import { BASE_URL } from '../config';
import EditPurchaseDetails from '../components/EditPurchaseDetails.jsx';
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

function PurchaseDetails() {
  const [showPurchaseModal, setPurchaseModal] = useState(false);
  const [purchases, setAllPurchasesData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyPurchase();
    } else {
      fetchYearlyPurchase();
    }
    const delayDebounceFn = setTimeout(() => {
      fetchPurchaseData();
    }, 500); // Debounce search query (500ms delay)
    fetchProductsData();
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchTerm,
    currentPage,
    category,
    limit,
    selectedCategory,
    selectedMonth,
    selectedYear,
    summaryType,
  ]);

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  const fetchPurchaseData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userRole = authContext.user.role;
      const allowedCategories = ['frame', 'glass', 'sunglasses'];

      // Start building the base URL for the purchase data
      let baseUrl = `${BASE_URL}/purchase?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}`;

      if (userRole === 'receptionist') {
        // If category is selected and allowed, add it
        if (category && allowedCategories.includes(category)) {
          baseUrl += `&category=${category}`;
        } else if (category === 'drug') {
          // If drug is somehow selected (shouldn't happen with UI restrictions), exclude it
          const categoryFilter = allowedCategories.join(',');
          baseUrl += `&category=${categoryFilter}`;
        } else {
          // If no specific valid category selected, include all allowed categories
          const categoryFilter = allowedCategories.join(','); // Join the allowed categories into a comma-separated string
          baseUrl += `&category=${categoryFilter}`;
        }
      } else if (userRole === 'admin') {
        // Admin can add any category or skip to see all
        if (category) {
          baseUrl += `&category=${category}`;
        }
      }

      const response = await fetch(baseUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAllPurchasesData(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProductsData = async () => {
    // Determine the URL based on the user's role
    const url =
      authContext.user.role === 'admin'
        ? `${BASE_URL}/inventory/product`
        : authContext.user.role === 'receptionist'
        ? `${BASE_URL}/glasses`
        : null;

    if (!url) {
      throw new Error('Invalid user role. Cannot fetch products.');
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAllProducts(data.data.results);
    } catch (err) {
      toast.error('Error fetching products:', err);
    }
  };

  const addSaleModalSetting = () => {
    setPurchaseModal(!showPurchaseModal);
  };

  const editModalSetting = () => {
    setShowEditModal(!showEditModal);
    if (showEditModal) {
      setSelectedPurchase(null);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const response = await fetch(`${BASE_URL}/purchase/${purchaseId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!response.ok) {
          let errorMessage = 'Failed to delete the purchase.';

          // Attempt to extract the error message from the server response
          try {
            const errorResponse = await response.json();
            errorMessage = errorResponse.message || errorMessage;
          } catch (jsonError) {
            errorMessage = (await response.text()) || errorMessage;
          }
          throw new Error(errorMessage);
        }
        fetchPurchaseData(); // Refresh the purchase list
      } catch (err) {
        setError(err.message || 'Failed to delete purchase. Please try again.');
        toast.error(err.message || 'Error deleting purchase:');
      }
    }
  };

  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setShowEditModal(true);
  };

  const handlePurchaseSuccess = () => {
    toast.success('Purchase added successfully!');
    fetchPurchaseData(); // refresh list
  };

  const fetchMonthlyPurchase = async () => {
    try {
      const userRole = authContext.user.role;
      const allowedCategories = ['frame', 'glass', 'sunglasses'];

      // Build URL with role-based filtering
      let url = `${BASE_URL}/purchase/${selectedYear}/${selectedMonth}?category=${selectedCategory}`;

      // For receptionist users, restrict to allowed categories if no specific category is selected
      if (userRole === 'receptionist') {
        if (!selectedCategory) {
          // If no category selected, include all allowed categories
          const categoryFilter = allowedCategories.join(',');
          url = `${BASE_URL}/purchase/${selectedYear}/${selectedMonth}?category=${categoryFilter}`;
        } else if (selectedCategory === 'drug') {
          // If drug is somehow selected (shouldn't happen with UI restrictions), exclude it
          const categoryFilter = allowedCategories.join(',');
          url = `${BASE_URL}/purchase/${selectedYear}/${selectedMonth}?category=${categoryFilter}`;
        }
      }

      const response = await fetch(url, {
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

  const fetchYearlyPurchase = async () => {
    try {
      const userRole = authContext.user.role;
      const allowedCategories = ['frame', 'glass', 'sunglasses'];

      // Build URL with role-based filtering
      let url = `${BASE_URL}/purchase/${selectedYear}?category=${selectedCategory}`;

      // For receptionist users, restrict to allowed categories if no specific category is selected
      if (userRole === 'receptionist') {
        if (!selectedCategory) {
          // If no category selected, include all allowed categories
          const categoryFilter = allowedCategories.join(',');
          url = `${BASE_URL}/purchase/${selectedYear}?category=${categoryFilter}`;
        } else if (selectedCategory === 'drug') {
          // If drug is somehow selected (shouldn't happen with UI restrictions), exclude it
          const categoryFilter = allowedCategories.join(',');
          url = `${BASE_URL}/purchase/${selectedYear}?category=${categoryFilter}`;
        }
      }

      const response = await fetch(url, {
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

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    // Refetch data when month changes
    fetchMonthlyPurchase();
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    // Refetch data when year changes
    if (summaryType === 'monthly') {
      fetchMonthlyPurchase();
    } else {
      fetchYearlyPurchase();
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
          label: 'Purchase',
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className='min-h-screen px-4 sm:px-6 py-6'>
      <div className='max-w-7xl mx-auto'>
        <ToastContainer />
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6'>
          Purchase List
        </h2>

        {showPurchaseModal && (
          <AddPurchaseDetails
            addSaleModalSetting={addSaleModalSetting}
            handlePageUpdate={handlePurchaseSuccess}
            authContext={authContext}
          />
        )}

        {showEditModal && selectedPurchase && (
          <EditPurchaseDetails
            editModalSetting={editModalSetting}
            purchase={selectedPurchase}
            handlePageUpdate={fetchPurchaseData}
          />
        )}

        <div className='bg-white overflow-hidden border rounded-lg shadow-sm'>
          {/* Filters and Actions Section */}
          <div className='p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4'>
            <div className='w-full sm:w-auto'>
              <label
                htmlFor='date-search'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Search by Date
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <HiSearch className='text-gray-400' size={20} />
                </div>
                <input
                  id='date-search'
                  type='date'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 h-10 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-start sm:items-end gap-4'>
              <div className='w-full sm:w-auto'>
                <label
                  htmlFor='category'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Filter by Category
                </label>
                <select
                  id='category'
                  name='category'
                  value={category}
                  onChange={handleCategoryChange}
                  className='block w-full sm:w-48 h-10 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Categories</option>
                  {authContext.user.role === 'admin' && (
                    <option value='drug'>Drug</option>
                  )}
                  <option value='sunglasses'>Sunglasses</option>
                  <option value='glass'>Glass</option>
                  <option value='frame'>Frame</option>
                </select>
              </div>

              <button
                className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                onClick={addSaleModalSetting}
              >
                <FaPlus className='mr-2' />
                Add Purchase
              </button>
            </div>
          </div>

          {/* Table Section with Horizontal Scrolling */}
          <div className='overflow-x-auto'>
            {isLoading ? (
              <div className='flex justify-center items-center py-10'>
                <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500'></div>
                <p className='ml-3 text-gray-600'>Loading...</p>
              </div>
            ) : error ? (
              <div className='text-center py-6 text-red-600'>{error}</div>
            ) : (
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
                        Quantity
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Category
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Purchase Date
                      </th>
                      {purchases?.expiryDate && (
                        <th
                          scope='col'
                          className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                        >
                          Expiry Date
                        </th>
                      )}
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Unit Price
                      </th>
                      <th
                        scope='col'
                        className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                      >
                        Total Price
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
                    {purchases.length > 0 ? (
                      purchases.map((element) => (
                        <tr
                          key={element._id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {element.ProductID?.name || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.originalQuantity || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.category || 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.date
                              ? new Date(element.date).toLocaleDateString() ===
                                new Date().toLocaleDateString()
                                ? 'Today'
                                : element.date.split('T')[0]
                              : 'N/A'}
                          </td>
                          {purchases?.expiryDate && (
                            <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                              {element.expiryDate
                                ? new Date(
                                    element.expiryDate
                                  ).toLocaleDateString() ===
                                  new Date().toLocaleDateString()
                                  ? 'Today'
                                  : element.expiryDate.split('T')[0]
                                : 'N/A'}
                            </td>
                          )}
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.UnitPurchaseAmount !== undefined
                              ? `${element.UnitPurchaseAmount.toFixed(2)}`
                              : 'N/A'}
                          </td>
                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {element.TotalPurchaseAmount !== undefined
                              ? `${element.TotalPurchaseAmount.toFixed(2)}`
                              : 'N/A'}
                          </td>

                          <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                            <div className='flex justify-center space-x-3'>
                              <button
                                onClick={() => handleEdit(element)}
                                className='text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors'
                                aria-label='Edit purchase'
                              >
                                <FaEdit className='w-4 h-4' />
                              </button>
                              <button
                                onClick={() => handleDelete(element._id)}
                                className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                                aria-label='Delete purchase'
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
                          colSpan={8}
                          className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                        >
                          No purchase records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Responsive indicator - only visible on small screens */}
            <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4 pb-2'>
              <p>Swipe horizontally to see more data</p>
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <Pagination
            totalItems={purchases.length}
            totalPagesCount={totalPages}
            itemsPerPage={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(limit) => setLimit(limit)}
          />
        </div>


        {/* Chart Section */}
        <div className='bg-white border rounded-lg shadow-sm p-4 sm:p-6 mb-6'>
          <h2 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4'>
            Purchase Summary
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            <div className='w-full sm:w-auto'>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Filter by Category
              </label>
              <select
                id='category'
                name='category'
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='block w-full sm:w-48 h-10 pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value=''>All Categories</option>
                {authContext.user.role === 'admin' && (
                  <option value='drug'>Drug</option>
                )}
                <option value='sunglasses'>Sunglasses</option>
                <option value='glass'>Glass</option>
                <option value='frame'>Frame</option>
              </select>
            </div>
            <div>
              <label
                htmlFor='summary-type'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Summary Type
              </label>
              <select
                id='summary-type'
                className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                onChange={handleSummaryTypeChange}
                value={summaryType}
              >
                <option value='monthly'>Monthly Summary</option>
                <option value='yearly'>Yearly Summary</option>
              </select>
            </div>
            {summaryType === 'monthly' && (
              <div>
                <label
                  htmlFor='month-select'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Select Month
                </label>
                <select
                  id='month-select'
                  className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
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
            {/* Always show Year filter for both yearly and monthly views */}
            <div>
              <label
                htmlFor='year-select'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Select Year
              </label>
              <select
                id='year-select'
                className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
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

          <div className='w-full h-[300px] sm:h-[350px] lg:h-[400px]'>
            <Bar
              data={getBarChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  title: {
                    display: true,
                    text:
                      summaryType === 'yearly'
                        ? `Yearly Summary for ${
                            selectedCategory || 'All Categories'
                          } (${selectedYear})`
                        : `Monthly Summary for ${
                            selectedCategory || 'All Categories'
                          } (${
                            monthLabels[selectedMonth - 1]
                          } ${selectedYear})`,
                    font: {
                      size: 14,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      font: {
                        size: 11,
                      },
                    },
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 11,
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PurchaseDetails;
