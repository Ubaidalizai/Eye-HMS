'use client';

import { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { BASE_URL } from '../config';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function DoctorFinance() {
  const [activeTab, setActiveTab] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({ data: { stats: [] } });

  useEffect(() => {
    // Update summaryType when activeTab changes
    setSummaryType(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyKhataSummary();
    } else {
      fetchYearlyKhataSummary();
    }
    fetchDrKhataSummary();
  }, [summaryType, selectedMonth, selectedYear]);

  const fetchDrKhataSummary = async () => {
    try {
      setLoading(true);
      // Include credentials to send cookies with the request
      const response = await fetch(`${BASE_URL}/khata/doctor-khata/summary`, {
        credentials: 'include', // This ensures cookies are sent with the request
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Summary data:', result);
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchMonthlyKhataSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/khata/doctor-khata/${selectedYear}/${selectedMonth}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Monthly data:', data);
      setSummary(data); // Assuming the backend returns a "summary" field
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetchYearlyKhataSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/khata/doctor-khata/${selectedYear}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Yearly data:', data);
      setSummary(data); // Assuming the backend returns a "summary" field
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // If loading, show loading state
  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading financial data...</p>
        </div>
      </div>
    );
  }

  // If error, show error state
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center bg-red-50 p-6 rounded-lg max-w-md'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-10 w-10 text-red-500 mx-auto mb-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h2 className='text-lg font-bold text-red-700 mb-2'>
            Error Loading Data
          </h2>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (!data) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-gray-600'>No financial data available.</p>
        </div>
      </div>
    );
  }

  // Format data for charts
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Check if summary.data and summary.data.stats exist
  const stats = summary?.data?.stats || [];

  const yearlyChartData = {
    labels: stats.map(
      (item) => monthNames[item.month - 1] || `Month ${item.month}`
    ),
    datasets: [
      {
        label: 'Income',
        data: stats.map((item) => item.income),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Outcome',
        data: stats.map((item) => item.outcome),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: stats.map((item) => `Day ${item.day}`),
    datasets: [
      {
        label: 'Income',
        data: stats.map((item) => item.income),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        tension: 0.3,
      },
      {
        label: 'Outcome',
        data: stats.map((item) => item.outcome),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value,
        },
      },
    },
  };

  // Find transactions with non-zero values
  const transactions = [];
  stats.forEach((item) => {
    if (item.income > 0) {
      transactions.push({
        date:
          summaryType === 'monthly'
            ? `${monthNames[selectedMonth - 1]} ${item.day}`
            : `${monthNames[item.month - 1]}`,
        name: 'Income Deposit',
        amount: item.income,
        type: 'income',
      });
    }
    if (item.outcome > 0) {
      transactions.push({
        date:
          summaryType === 'monthly'
            ? `${monthNames[selectedMonth - 1]} ${item.day}`
            : `${monthNames[item.month - 1]}`,
        name: 'Expense Payment',
        amount: item.outcome,
        type: 'outcome',
      });
    }
  });

  // Get current date for the header
  const currentDate = new Date();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  return (
    <div className='max-w-7xl mx-auto px-4 py-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-800 mb-4 sm:mb-0'>
          Financial Dashboard
        </h1>
        <div className='bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-gray-700'>
          <span>
            {currentMonth} {currentYear}
          </span>
        </div>
      </header>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
        {/* Income Card */}
        <div className='bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
          <h3 className='text-sm font-medium text-gray-500 mb-2 relative z-10'>
            Total Income
          </h3>
          <p className='text-2xl font-bold text-emerald-600 relative z-10'>
            {data?.data?.totalIncome || 0}
          </p>
          <div className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-500 opacity-20'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5'
            >
              <polyline points='23 6 13.5 15.5 8.5 10.5 1 18'></polyline>
              <polyline points='17 6 23 6 23 12'></polyline>
            </svg>
          </div>
        </div>

        {/* Outcome Card */}
        <div className='bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
          <h3 className='text-sm font-medium text-gray-500 mb-2 relative z-10'>
            Total Outcome
          </h3>
          <p className='text-2xl font-bold text-red-600 relative z-10'>
            {data?.data?.totalOutcome || 0}
          </p>
          <div className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-500 opacity-20'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5'
            >
              <polyline points='23 18 13.5 8.5 8.5 13.5 1 6'></polyline>
              <polyline points='17 18 23 18 23 12'></polyline>
            </svg>
          </div>
        </div>

        {/* Balance Card */}
        <div className='bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
          <h3 className='text-sm font-medium text-gray-500 mb-2 relative z-10'>
            You Will Get
          </h3>
          <p className='text-2xl font-bold text-blue-600 relative z-10'>
            {data?.data?.youWillGet || 0}
          </p>
          <div className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 opacity-20'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5'
            >
              <line x1='12' y1='1' x2='12' y2='23'></line>
              <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'></path>
            </svg>
          </div>
        </div>

        {/* You Will Give Card */}
        <div className='bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
          <h3 className='text-sm font-medium text-gray-500 mb-2 relative z-10'>
            You Will Give
          </h3>
          <p className='text-2xl font-bold text-orange-600 relative z-10'>
            {data?.data?.youWillGive || 0}
          </p>
          <div className='absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-500 opacity-20'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5'
            >
              <path d='M12 2v20'></path>
              <path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Date Filter Controls */}
      <div className='flex flex-wrap gap-4 mb-6 mt-8'>
        {activeTab === 'monthly' && (
          <select
            className='p-2 border rounded w-20'
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {monthNames[i]}
              </option>
            ))}
          </select>
        )}

        <select
          className='p-2 border rounded w-20'
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      </div>

      {/* Chart Section */}
      <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 sm:mb-0'>
            Financial Overview
          </h2>
          <div className='flex border-b border-gray-200 w-full sm:w-auto'>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'monthly'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('monthly');
                setSummaryType('monthly');
              }}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'yearly'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => {
                setActiveTab('yearly');
                setSummaryType('yearly');
              }}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className='h-[300px]'>
          {stats.length > 0 ? (
            <>
              {activeTab === 'monthly' && (
                <Line
                  data={monthlyChartData}
                  options={chartOptions}
                  height={300}
                />
              )}
              {activeTab === 'yearly' && (
                <Bar
                  data={yearlyChartData}
                  options={chartOptions}
                  height={300}
                />
              )}
            </>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className='text-gray-500'>
                No data available for the selected period
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
        <h2 className='text-lg font-semibold text-gray-800 mb-6'>
          Recent Activity
        </h2>

        {transactions.length > 0 ? (
          <div className='space-y-4'>
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className='flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
              >
                <div className='flex flex-col'>
                  <span className='text-xs text-gray-500 mb-1'>
                    {transaction.date}
                  </span>
                  <span className='font-medium'>{transaction.name}</span>
                </div>
                <span
                  className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {transaction.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500'>
            <p>No recent transactions to display</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center'>
        <div className='flex space-x-8 mb-4 sm:mb-0'>
          <div className='flex flex-col'>
            <span className='text-xs text-gray-500 mb-1'>
              Total Transactions
            </span>
            <span className='font-semibold text-gray-800'>
              {transactions.length}
            </span>
          </div>
          <div className='flex flex-col'>
            <span className='text-xs text-gray-500 mb-1'>Last Updated</span>
            <span className='font-semibold text-gray-800'>
              {currentDate.toLocaleDateString()}
            </span>
          </div>
        </div>
        <button className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='w-4 h-4'
          >
            <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
            <polyline points='7 10 12 15 17 10'></polyline>
            <line x1='12' y1='15' x2='12' y2='3'></line>
          </svg>
          <span>Export Data</span>
        </button>
      </div>
    </div>
  );
}

export default DoctorFinance;
