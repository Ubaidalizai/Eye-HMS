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
import './newManagement.css';

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
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // Number of items per page

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyExpenses();
    } else {
      fetchYearlyExpenses();
    }
    fetchExpenses(); // Fetch paginated expenses for the list
  }, [currentPage, selectedCategory, selectedMonth, selectedYear, summaryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: value });
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/expense?page=${currentPage}&limit=${limit}`,
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
        `http://localhost:4000/api/v1/expense/${selectedYear}/${selectedMonth}?category=${selectedCategory}`,
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
        `http://localhost:4000/api/v1/expense/${selectedYear}?category=${selectedCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setSummary(data.data); // Assuming the backend returns a "summary" field
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let baseUrl = `http://localhost:4000/api/v1/expense`;
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
      setShowForm(false);
      fetchExpenses(); // Refresh the list after adding/updating
      if (summaryType === 'monthly') {
        fetchMonthlyExpenses();
      } else {
        fetchYearlyExpenses();
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const editExpense = (expense) => {
    setNewExpense(expense);
    setShowForm(true);
  };

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/expense/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

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
      const amount = parseFloat(expense.amount);
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
    let labels = [];
    let data = [];

    if (summaryType === 'yearly') {
      labels = monthLabels; // Use month names for yearly data
      data = summary || Array(12).fill(0); // Yearly data (assumed as monthly totals)
    } else if (summaryType === 'monthly') {
      // Use day labels for the selected month
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);

      // Filter expenses by selected month and year, and aggregate daily totals
      data = Array(daysInMonth).fill(0);
      expenses.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth() + 1;
        const expenseYear = expenseDate.getFullYear();
        const expenseDay = expenseDate.getDate();

        if (expenseMonth === selectedMonth && expenseYear === selectedYear) {
          data[expenseDay - 1] += parseFloat(expense.amount);
        }
      });
    }

    return {
      labels,
      datasets: [
        {
          label: 'Expenses',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="parent">
      <h1>Expense Management</h1>
      <button
        className="add-expense-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add Expense'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} className="expense-form">
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={newExpense.amount}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="reason"
            placeholder="Reason"
            value={newExpense.reason}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={newExpense.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button type="submit">
            {newExpense._id ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      )}
      {/* Expense List */}
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reason</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id}>
              <td>{expense.date}</td>
              <td>{expense.reason}</td>
              <td>{expense.amount}</td>
              <td>{expense.category}</td>
              <td>
                <button onClick={() => editExpense(expense)}>Edit</button>
                <button onClick={() => deleteExpense(expense._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? 'active' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="general-div">
        <div className="filter-category">
          <h2>Filter by Category</h2>
          <select onChange={handleCategoryChange} value={selectedCategory}>
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="summery-type">
          <h2>Summary Type</h2>
          <select onChange={handleSummaryTypeChange} value={summaryType}>
            <option value="monthly">Monthly Summary</option>
            <option value="yearly">Yearly Summary</option>
          </select>
        </div>

        {summaryType === 'monthly' && (
          <div>
            <h2>Select Month</h2>
            <select onChange={handleMonthChange} value={selectedMonth}>
              {monthLabels.map((label, index) => (
                <option key={index} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {summaryType === 'yearly' && (
          <div>
            <h2>Select Year</h2>
            <input
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>
        )}
      </div>
      <div className="chart-container">
        <Bar data={getBarChartData()} />
      </div>
      ;{/* Charts */}
      <div className="chart">
        <div className="graph">
          <Doughnut
            data={{
              labels: categories,
              datasets: [
                {
                  label: 'Expenses by Category',
                  data: categories.map((category) =>
                    expenses
                      .filter((expense) => expense.category === category)
                      .reduce(
                        (total, expense) => total + Number(expense.amount),
                        0
                      )
                  ),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                  ],
                  borderWidth: 1,
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
