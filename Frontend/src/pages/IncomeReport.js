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

const categories = ['drug', 'sunglasses', 'frame'];

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

const IncomeReport = () => {
  const [income, setIncome] = useState([]);
  const [newIncome, setNewIncome] = useState({
    totalIncome: '',
    totalNetIncome: '',
    date: '',
    reason: '',
    category: '',
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
      fetchMonthlyIncome();
    } else {
      fetchYearlyIncome();
    }
    fetchIncome(); // Fetch paginated income for the list
  }, [currentPage, selectedCategory, selectedMonth, selectedYear, summaryType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewIncome({ ...newIncome, [name]: value });
  };

  const fetchIncome = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income?page=${currentPage}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setIncome(data.data.results);
      setTotalPages(data.totalPages || Math.ceil(data.results / limit));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMonthlyIncome = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income/${selectedYear}/${selectedMonth}?category=${selectedCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      // Set summary to the data object directly
      setSummary(data.data); // Now summary should be { totalIncome, totalNetIncome }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchYearlyIncome = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income/${selectedYear}?category=${selectedCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      // Set summary to the data object directly
      setSummary(data.data); // Now summary should be { totalIncome, totalNetIncome }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let baseUrl = `http://localhost:4000/api/v1/income`;
    const url = newIncome?._id
      ? baseUrl +
        `/${newIncome._id}?page=${currentPage}&limit=${limit}&category=${selectedCategory}`
      : baseUrl +
        `?page=${currentPage}&limit=${limit}&category=${selectedCategory}`; // Update URL for editing or adding new income
    const method = newIncome?._id ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIncome),
      });

      if (!response.ok) {
        throw new Error(
          newIncome._id ? 'Failed to update income' : 'Failed to add income'
        );
      }

      // Reset form and refetch income
      setNewIncome({
        totalIncome: '',
        totalNetIncome: '',
        date: '',
        reason: '',
        category: '',
      });
      setShowForm(false);
      fetchIncome(); // Refresh the list after adding/updating
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  const editIncome = (income) => {
    setNewIncome(income);
    setShowForm(true);
  };

  const deleteIncome = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/income/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete income');
      }

      fetchIncome();
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const aggregateIncome = () => {
    const monthlyData = Array(12).fill(0);
    const yearlyData = {};

    income.forEach((income) => {
      const date = new Date(income.date);
      const amount = parseFloat(income.amount);
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
    const newSummary = aggregateIncome();
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
    let labels, incomeData, netIncomeData;

    if (summaryType === 'yearly') {
      labels = monthLabels;
      // Use the arrays directly from summary
      incomeData = summary.totalIncome;
      netIncomeData = summary.totalNetIncome;
    } else {
      // For monthly view
      labels = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`);
      // Use the arrays directly from summary
      incomeData = summary.totalIncome;
      netIncomeData = summary.totalNetIncome;
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Income',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Net Income',
          data: netIncomeData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="parent">
      <h1>Income Management</h1>
      <button
        className="add-income-button"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Add Income'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="income-form">
          <input
            type="number"
            name="totalIncome"
            placeholder="Total Income"
            value={newIncome.totalIncome}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="totalNetIncome"
            placeholder="Total Net Income"
            value={newIncome.totalNetIncome}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="date"
            value={newIncome.date}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="reason"
            placeholder="Reason"
            value={newIncome.reason}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            value={newIncome.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button className="UpdateBtn" type="submit">
            {newIncome._id ? 'Update Income' : 'Add Income'}
          </button>
        </form>
      )}

      <div className="income-list-detail">
        <div className="summary-display">
          <h2>income</h2>
          <table className="income-table">
            <thead>
              <tr>
                <th>TotalIncome</th>
                <th>TotalNetIncome</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.length === 0 ? (
                <tr>
                  <td colSpan="5">No income added yet.</td>
                </tr>
              ) : (
                income.map((income) => (
                  <tr key={income._id}>
                    <td>{income.totalIncome}</td>
                    <td>{income.totalNetIncome}</td>
                    <td>{new Date(income.date).toLocaleDateString()}</td>
                    <td>{income.reason}</td>
                    <td>{income.category}</td>
                    <td>
                      <button
                        onClick={() => editIncome(income)} // This sets the selected income in the form
                        className="edit-button"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteIncome(income._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || totalPages === 0}
            >
              Previous
            </button>

            <span className="flex items-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
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

        <div className="summary-display">
          <h2>
            {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
            for {selectedCategory}
          </h2>
          {summary ? (
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
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="chart">
          <h2>Income by Category</h2>
          <div className="graph">
            <Doughnut
              data={{
                labels: categories,
                datasets: [
                  {
                    data: categories.map((category) =>
                      income
                        .filter((exp) => exp.category === category)
                        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
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

export default IncomeReport;
