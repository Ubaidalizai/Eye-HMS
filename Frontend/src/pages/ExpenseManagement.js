import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { MdOutlineDeleteOutline } from 'react-icons/md';
import { FaPlus, FaRegEdit, FaTrash } from 'react-icons/fa';
import Pagination from '../components/Pagination';

import './newManagement.css';
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

const categories = ['food', 'salary', 'furniture', 'other'];

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

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  newExpense,
  handleChange,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-600 flex items-center justify-center overflow-y-auto h-full w-full bg-opacity-50 z-50'>
      <div className='overlay' onClick={onClose}></div>
      <div className='relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-60'>
        <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
          <div className='sm:flex sm:items-start'>
            <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='h-6 w-6 text-blue-400'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4.5v15m7.5-7.5h-15'
                />
              </svg>
            </div>
            <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
              <h3 className='text-lg font-semibold leading-6 text-gray-900'>
                Add Expense
              </h3>
              <form onSubmit={onSubmit}>
                <div className='grid gap-4 mb-4 sm:grid-cols-2'>
                  <div>
                    <label
                      htmlFor='amount'
                      className='block mb-2 text-sm font-medium text-gray-900'
                    >
                      Amount
                    </label>
                    <input
                      type='number'
                      name='amount'
                      id='amount'
                      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                      value={newExpense.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='date'
                      className='block mb-2 text-sm font-medium text-gray-900'
                    >
                      Date
                    </label>
                    <input
                      type='date'
                      name='date'
                      id='date'
                      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5'
                      value={newExpense.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className='grid gap-4 mb-4 sm:grid-cols-2'>
                  <div className='mt-4'>
                    <label
                      htmlFor='reason'
                      className='block mb-2 text-sm font-medium text-gray-900'
                    >
                      Reason
                    </label>
                    <input
                      type='text'
                      name='reason'
                      id='reason'
                      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                      value={newExpense.reason}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className='mt-4'>
                    <label
                      htmlFor='category'
                      className='block mb-2 text-sm font-medium text-gray-900'
                    >
                      Category
                    </label>
                    <select
                      name='category'
                      id='category'
                      className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg'
                      value={newExpense.category}
                      onChange={handleChange}
                      required
                    >
                      <option value=''>Select Category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='flex items-center justify-end gap-2'>
                  <button
                    type='button'
                    className='inline-flex items-center px-3 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='inline-flex items-center px-2 py-1 border border-transparent text-sm mr-0 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none  focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
        `${BASE_URL}/expense?page=${currentPage}&limit=${limit}&fieldName=date&searchTerm=${searchTerm}`,
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

  const aggregateExpenses = () => {
    const monthlyData = Array(12).fill(0);
    const yearlyData = {};

    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const amount = Number.parseFloat(expense.amount);
      const month = date.getMonth(); // Zero-based index
      const year = date.getFullYear();

      // Aggregate for yearly summary
      if (summaryType === 'yearly') {
        if (!yearlyData[year]) {
          yearlyData[year] = Array(12).fill(0); // Initialize months for the year
        }
        yearlyData[year][month] += amount; // Sum amount for the respective month
      }

      // Aggregate for monthly summary
      if (
        summaryType === 'monthly' &&
        month + 1 === selectedMonth &&
        year === selectedYear
      ) {
        monthlyData[month] += amount; // Sum amount for the respective day
      }
    });

    return summaryType === 'yearly' ? yearlyData : monthlyData;
  };

  const updateSummary = () => {
    const newSummary = aggregateExpenses();
    setSummary(newSummary);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    updateSummary();
  };

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
    updateSummary();
  };

  const handleMonthChange = (e) => {
    const month = Number(e.target.value);
    setSelectedMonth(month);
    updateSummary();
  };

  const handleYearChange = (e) => {
    const year = Number(e.target.value);
    setSelectedYear(year);
    updateSummary();
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
    <div className=''>
      <h2 className='font-semibold text-xl mb-12'>Expense List</h2>

      <div className='expense-list-detail border rounded-md'>
        <div className='summary-display'>
          <div className='flex items-center justify-between py-5'>
            <div className='flex items-center justify-center z-0'>
              <HiSearch className=' translate-x-7 text-gray-400' size={20} />
              <input
                type='date'
                placeholder='Search by date'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 border border-gray-300 rounded w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 h-9'
              />
            </div>

            <button
              className='inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none mr-6 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              onClick={() => setShowModal(true)}
            >
              <FaPlus className='mr-2' /> Add Expense
            </button>

            {/* Modal for adding expense */}
            <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleSubmit}
              newExpense={newExpense}
              handleChange={handleChange}
              isSubmitting={isSubmitting}
            />
          </div>

          <div className='overflow-x-auto '>
            <table className='w-full text-sm text-left text-gray-500'>
              <thead className='text-xs text-gray-700 uppercase bg-gray-100'>
                <tr>
                  <th scope='col' className='px-6 py-3'>
                    Amount
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    Date
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    Reason
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    Category
                  </th>
                  <th scope='col' className='px-6 py-3'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!expenses || expenses.length === 0 ? (
                  <tr className='bg-white border-b'>
                    <td
                      colSpan={5}
                      className='px-6 py-4 font-medium text-gray-500 whitespace-nowrap text-center'
                    >
                      No expenses added yet.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className='bg-white border-b hover:bg-gray-50'
                    >
                      <td className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                        {expense.amount?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className='px-6 py-4'>
                        {expense.date
                          ? new Date(expense.date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className='px-6 py-4'>{expense.reason ?? 'N/A'}</td>
                      <td className='px-6 py-4'>{expense.category ?? 'N/A'}</td>
                      <td className='px-6 py-4'>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => editExpense(expense)}
                            className='font-medium text-indigo-600 hover:text-indigo-900'
                          >
                            <FaRegEdit className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => deleteExpense(expense._id)}
                            className='font-medium text-red-600 hover:text-red-700'
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
        </div>
        <Pagination
          totalItems={expenses.length}
          totalPagesCount={totalPages}
          itemsPerPage={limit}
          currentPage={currentPage}
          onPageChange={(page) => setCurrentPage(page)}
          onLimitChange={(limit) => setLimit(limit)}
        />
        <div className='flex items-center px-5 justify-start gap-3 mt-10'>
          <div className='filter-category'>
            <select
              className='dropdown'
              onChange={handleCategoryChange}
              value={selectedCategory}
            >
              <option value=''>All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className='summery-type'>
            <select
              className='dropdown'
              onChange={handleSummaryTypeChange}
              value={summaryType}
            >
              <option value='monthly'>Monthly Summary</option>
              <option value='yearly'>Yearly Summary</option>
            </select>
          </div>

          {summaryType === 'monthly' && (
            <div className='month-selection'>
              <select
                className='dropdown'
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

          {summaryType === 'yearly' && (
            <div className='flex items-center'>
              <h2 className='year-label'>Select Year</h2>
              <input
                className='mx-2'
                type='number'
                value={selectedYear}
                onChange={handleYearChange}
                min='2000'
                max={new Date().getFullYear()}
              />
            </div>
          )}
        </div>

        <div className='px-5'>
          <h2>
            {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
            for {selectedCategory}
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
                  } Summary for ${selectedCategory}`,
                },
              },
            }}
          />
        </div>

        <div className='px-5 mt-5'>
          <h2>Expense by Category</h2>
          <div className='w-80 h-80'>
            <Doughnut
              data={{
                labels: categories,
                datasets: [
                  {
                    data: categories.map(
                      (category) =>
                        expenses
                          .filter((exp) => exp.category === category)
                          .reduce(
                            (sum, exp) => sum + Number.parseFloat(exp.amount),
                            0
                          ) // Initialize sum to 0
                    ),
                    backgroundColor: [
                      '#FF6384',
                      '#36A2EB',
                      '#FFCE56',
                      '#4BC0C0',
                    ],
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
