import React, { useState } from "react";
import { Bar, Line } from "react-chartjs-2";
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
} from "chart.js";

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
  const [activeTab, setActiveTab] = useState("weekly");

  // Financial data from the JSON
  const data = {
    status: "success",
    data: {
      total: {
        income: 146,
        outcome: 0,
      },
      yearly: [
        { month: 1, income: 0, outcome: 0 },
        { month: 2, income: 0, outcome: 0 },
        { month: 3, income: 0, outcome: 0 },
        { month: 4, income: 146, outcome: 0 },
        { month: 5, income: 0, outcome: 0 },
        { month: 6, income: 0, outcome: 0 },
        { month: 7, income: 0, outcome: 0 },
        { month: 8, income: 0, outcome: 0 },
        { month: 9, income: 0, outcome: 0 },
        { month: 10, income: 0, outcome: 0 },
        { month: 11, income: 0, outcome: 0 },
        { month: 12, income: 0, outcome: 0 },
      ],
      monthly: [
        { day: 1, income: 0, outcome: 0 },
        { day: 2, income: 0, outcome: 0 },
        { day: 3, income: 0, outcome: 0 },
        { day: 4, income: 0, outcome: 0 },
        { day: 5, income: 0, outcome: 0 },
        { day: 6, income: 0, outcome: 0 },
        { day: 7, income: 0, outcome: 0 },
        { day: 8, income: 0, outcome: 0 },
        { day: 9, income: 0, outcome: 0 },
        { day: 10, income: 0, outcome: 0 },
        { day: 11, income: 0, outcome: 0 },
        { day: 12, income: 0, outcome: 0 },
        { day: 13, income: 0, outcome: 0 },
        { day: 14, income: 0, outcome: 0 },
        { day: 15, income: 0, outcome: 0 },
        { day: 16, income: 0, outcome: 0 },
        { day: 17, income: 0, outcome: 0 },
        { day: 18, income: 0, outcome: 0 },
        { day: 19, income: 0, outcome: 0 },
        { day: 20, income: 0, outcome: 0 },
        { day: 21, income: 0, outcome: 0 },
        { day: 22, income: 0, outcome: 0 },
        { day: 23, income: 0, outcome: 0 },
        { day: 24, income: 0, outcome: 0 },
        { day: 25, income: 0, outcome: 0 },
        { day: 26, income: 0, outcome: 0 },
        { day: 27, income: 0, outcome: 0 },
        { day: 28, income: 20, outcome: 0 },
        { day: 29, income: 126, outcome: 0 },
        { day: 30, income: 0, outcome: 0 },
      ],
      weekly: [
        { day: 1, income: 0, outcome: 0 },
        { day: 2, income: 20, outcome: 0 },
        { day: 3, income: 126, outcome: 0 },
        { day: 4, income: 0, outcome: 0 },
        { day: 5, income: 0, outcome: 0 },
        { day: 6, income: 0, outcome: 0 },
        { day: 7, income: 0, outcome: 0 },
      ],
      youWillGet: 0,
      youWillGive: 146,
    },
  };

  // Format data for charts
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const yearlyChartData = {
    labels: data.data.yearly.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: "Income",
        data: data.data.yearly.map((item) => item.income),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Outcome",
        data: data.data.yearly.map((item) => item.outcome),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const monthlyChartData = {
    labels: data.data.monthly.map((item) => `Day ${item.day}`),
    datasets: [
      {
        label: "Income",
        data: data.data.monthly.map((item) => item.income),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        tension: 0.3,
      },
      {
        label: "Outcome",
        data: data.data.monthly.map((item) => item.outcome),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        tension: 0.3,
      },
    ],
  };

  const weeklyChartData = {
    labels: weekDays,
    datasets: [
      {
        label: "Income",
        data: data.data.weekly.map((item) => item.income),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Outcome",
        data: data.data.weekly.map((item) => item.outcome),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
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
          callback: function (value) {
            return "$" + value;
          },
        },
      },
    },
  };

  // Find transactions with non-zero values
  const transactions = [];
  data.data.monthly.forEach((day) => {
    if (day.income > 0) {
      transactions.push({
        date: `Apr ${day.day}`,
        name: "Income Deposit",
        amount: day.income,
        type: "income",
      });
    }
    if (day.outcome > 0) {
      transactions.push({
        date: `Apr ${day.day}`,
        name: "Expense Payment",
        amount: day.outcome,
        type: "outcome",
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
        <div className='bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors'>
          <span>
            {currentMonth} {currentYear}
          </span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {/* Income Card */}
        <div className='bg-white rounded-xl shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1'>
          <h3 className='text-sm font-medium text-gray-500 mb-2 relative z-10'>
            Total Income
          </h3>
          <p className='text-2xl font-bold text-emerald-600 relative z-10'>
            ${data.data.total.income}
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
            ${data.data.total.outcome}
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
            Balance
          </h3>
          <p className='text-2xl font-bold text-blue-600 relative z-10'>
            ${data.data.total.income - data.data.total.outcome}
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
            ${data.data.youWillGive}
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

      {/* Chart Section */}
      <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4 sm:mb-0'>
            Financial Overview
          </h2>
          <div className='flex border-b border-gray-200 w-full sm:w-auto'>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "weekly"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "monthly"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "yearly"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className='h-[300px]'>
          {activeTab === "weekly" && (
            <Bar data={weeklyChartData} options={chartOptions} height={300} />
          )}
          {activeTab === "monthly" && (
            <Line data={monthlyChartData} options={chartOptions} height={300} />
          )}
          {activeTab === "yearly" && (
            <Bar data={yearlyChartData} options={chartOptions} height={300} />
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
                    transaction.type === "income"
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}$
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
