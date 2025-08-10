import { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import CategorySelector from '../components/CategorySelector.jsx';
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
import AddExpense from "../components/addExpens.jsx";
import Pagination from "../components/Pagination.jsx";

import { HiSearch } from 'react-icons/hi';
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

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    date: '',
    reason: '',
    category: '',
    id: null,
  });
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tableCategory, setTableCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Added state for submitting

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyExpenses();
    } else {
      fetchYearlyExpenses();
    }
    fetchExpenses(); // Fetch paginated expenses for the list
  }, [
    currentPage,
    selectedCategory,
    tableCategory,
    selectedMonth,
    selectedYear,
    summaryType,
    searchTerm,
    limit,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/expense?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}&category=${tableCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setExpenses(data.data.results);

      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMonthlyExpenses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/expense/${selectedYear}/${selectedMonth}?category=${selectedCategory}`,
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

  const fetchYearlyExpenses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/expense/${selectedYear}?category=${selectedCategory}`,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set isSubmitting to true before submission

    const baseUrl = `${BASE_URL}/expense`;
    const url = newExpense._id
      ? baseUrl +
        `/${newExpense._id}?page=${currentPage}&limit=${limit}&category=${selectedCategory}`
      : baseUrl +
        `?page=${currentPage}&limit=${limit}&category=${selectedCategory}`; // Update URL for editing or adding new expense
    const method = newExpense._id ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error(
          newExpense._id ? 'Failed to update expense' : 'Failed to add expense'
        );
      }

      // Reset form and refetch expenses
      setNewExpense({
        amount: '',
        date: '',
        reason: '',
        category: '',
        _id: null,
      });
      setShowModal(false); // Close the modal after submission
      fetchExpenses(); // Refresh the list after adding/updating
      if (summaryType === 'monthly') {
        fetchMonthlyExpenses();
      } else {
        fetchYearlyExpenses();
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const editExpense = (expense) => {
    setNewExpense(expense);
    setShowModal(true);
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const response = await fetch(`${BASE_URL}/expense/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      fetchExpenses();
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    // Refetch data when month changes
    fetchMonthlyExpenses();
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    // Refetch data when year changes
    if (summaryType === 'monthly') {
      fetchMonthlyExpenses();
    } else {
      fetchYearlyExpenses();
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
          label: 'Expenses',
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };



  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 py-6'>
      <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6'>
        Expense List
      </h2>

      <div className='bg-white border rounded-lg shadow-sm mb-6'>
        {/* Search and Filter Section */}
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
                htmlFor='table-category'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Filter by Category
              </label>
              <CategorySelector
                type="expense"
                value={tableCategory}
                onChange={(value) => {
                  setTableCategory(value);
                  setCurrentPage(1);
                }}
                placeholder='Select Category'
                className='w-full sm:w-48'
              />
            </div>

            <button
              className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 h-10 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
              onClick={() => setShowModal(true)}
            >
              <FaPlus className='mr-2' /> Add Expense
            </button>
          </div>
        </div>

        {/* Table Section with Horizontal Scrolling */}
        <div className='border-t border-gray-200'>
          <div className='overflow-x-auto'>
            <div className='inline-block min-w-full align-middle'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                    >
                      Amount
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
                      Reason
                    </th>
                    <th
                      scope='col'
                      className='px-4 sm:px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider text-left'
                    >
                      Category
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
                  {!expenses || expenses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className='px-4 sm:px-6 py-4 text-center text-sm text-gray-500'
                      >
                        No expenses added yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((expense) => (
                      <tr
                        key={expense.id || expense._id}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {expense.amount?.toFixed(2) ?? '0.00'}
                        </td>
                        <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {expense.date ? expense.date.split('T')[0] : 'N/A'}
                        </td>
                        <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {expense.reason ?? 'N/A'}
                        </td>
                        <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {expense.category ?? 'N/A'}
                        </td>
                        <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-center'>
                          <div className='flex justify-center space-x-3'>
                            <button
                              onClick={() => editExpense(expense)}
                              className='text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors'
                              aria-label='Edit expense'
                            >
                              <FaRegEdit className='w-4 h-4' />
                            </button>
                            <button
                              onClick={() => deleteExpense(expense._id)}
                              className='text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors'
                              aria-label='Delete expense'
                            >
                              <FaTrash className='w-4 h-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Responsive indicator - only visible on small screens */}
            <div className='block sm:hidden text-center text-xs text-gray-500 mt-2 px-4 pb-2'>
              <p>Swipe horizontally to see more data</p>
            </div>
          </div>
        </div>

        <div className='px-4 sm:px-6 py-4'>
          <Pagination
            totalItems={expenses.length}
            totalPagesCount={totalPages}
            itemsPerPage={limit}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            onLimitChange={(limit) => setLimit(limit)}
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className='bg-white border rounded-lg shadow-sm p-4 sm:p-6 mb-6'>
        <h2 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4'>
          Expense Summary
        </h2>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <div>
            <label
              htmlFor='chart-category'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by Category
            </label>
            <CategorySelector
              type="expense"
              value={selectedCategory}
              onChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
              placeholder='Select Category'
            />
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
                        } (${monthLabels[selectedMonth - 1]} ${selectedYear})`,
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

      {/* Modal for adding expense */}
      <AddExpense
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        newExpense={newExpense}
        handleChange={handleChange}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default ExpenseManagement;
