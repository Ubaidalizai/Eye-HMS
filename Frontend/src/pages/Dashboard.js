import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthContext from '../AuthContext';
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
const models = ['sales', 'purchase', 'income'];
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

function Dashboard() {
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardSummary, setDashboardSummary] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('sales');
  const [summary, setSummary] = useState({});
  const authContext = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardSummary();
    if (summaryType === 'monthly') {
      fetchMonthlyStats();
    } else {
      fetchYearlyStats();
    }
  }, [
    selectedCategory,
    selectedMonth,
    selectedYear,
    summaryType,
    selectedModel,
  ]);

  const fetchMonthlyStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/${selectedModel}/${selectedYear}/${selectedMonth}?category=${selectedCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      console.log(selectedYear, selectedMonth);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchYearlyStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/${selectedModel}/${selectedYear}/?category=${selectedCategory}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      const data = await response.json();

      setSummary(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    const month = Number(e.target.value);
    setSelectedMonth(month);
  };

  const handleYearChange = (e) => {
    const year = Number(e.target.value);
    setSelectedYear(year);
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  const getBarChartData = () => {
    let labels, data;

    if (summaryType === 'yearly') {
      labels = monthLabels;
      data = summary.data || Array(12).fill(0);
    } else {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      data = summary.data || Array(30).fill(0);
    }

    return {
      labels,
      datasets: [
        {
          label: selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1),
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(
        'http://localhost:4000/api/v1/dashboard/summary',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await response.json();
      setDashboardSummary(data.data);
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch dashboard summary');
    }
  };

  return (
    <>
      <div className='grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-4 p-4'>
        <article className='flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6'>
          <div className='inline-flex gap-2 self-end rounded bg-green-100 p-1 text-green-600'>
            <span className='text-xs font-medium'>67.81%</span>
          </div>
          <div>
            <strong className='block text-sm font-medium text-gray-500'>
              Total Sales
            </strong>
            <p>
              <span className='text-2xl font-medium text-gray-900'>
                ${dashboardSummary.totalSales}
              </span>
            </p>
          </div>
        </article>

        <article className='flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6'>
          <div className='inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600'>
            <span className='text-xs font-medium'>67.81%</span>
          </div>
          <div>
            <strong className='block text-sm font-medium text-gray-500'>
              Purchase
            </strong>
            <p>
              <span className='text-2xl font-medium text-gray-900'>
                ${dashboardSummary.totalPurchases}
              </span>
            </p>
          </div>
        </article>

        <article className='flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6'>
          <div className='inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600'>
            <span className='text-xs font-medium'>67.81%</span>
          </div>
          <div>
            <strong className='block text-sm font-medium text-gray-500'>
              Total Products
            </strong>
            <p>
              <span className='text-2xl font-medium text-gray-900'>
                {dashboardSummary.totalProductsCount}
              </span>
            </p>
          </div>
        </article>

        <article className='flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6'>
          <div className='inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600'>
            <span className='text-xs font-medium'>67.81%</span>
          </div>
          <div>
            <strong className='block text-sm font-medium text-gray-500'>
              Total Expense
            </strong>
            <p>
              <span className='text-2xl font-medium text-gray-900'>
                ${dashboardSummary.totalExpenses}
              </span>
            </p>
          </div>
        </article>

        <article className='flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6'>
          <div className='inline-flex gap-2 self-end rounded bg-red-100 p-1 text-red-600'>
            <span className='text-xs font-medium'>67.81%</span>
          </div>
          <div>
            <strong className='block text-sm font-medium text-gray-500'>
              Total Income
            </strong>
            <p>
              <span className='text-2xl font-medium text-gray-900'>
                ${dashboardSummary.totalIncome}
              </span>
            </p>
          </div>
        </article>
      </div>
      <div className='parent'>
        <div className='general-div'>
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

          <div className='model-selection'>
            <select
              className='dropdown'
              onChange={handleModelChange}
              value={selectedModel}
            >
              {models.map((model, index) => (
                <option key={index} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
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
            <div className='year-selection'>
              <h2 className='year-label'>Select Year</h2>
              <input
                className='year-input'
                type='number'
                value={selectedYear}
                onChange={handleYearChange}
                min='2000'
                max={new Date().getFullYear()}
              />
            </div>
          )}
        </div>
        <div className='summary-display'>
          <h2>
            {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
            for {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}
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
                  } Summary for ${
                    selectedModel.charAt(0).toUpperCase() +
                    selectedModel.slice(1)
                  }`,
                },
              },
            }}
          />
        </div>
        <div className='chart'>
          <h2>
            {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} by
            Category
          </h2>
          <div className='graph'>
            <Doughnut
              data={{
                labels: categories,
                datasets: [
                  {
                    data: categories.map((category) =>
                      (summary.data || [])
                        .filter((item) => item.category === category)
                        .reduce((sum, item) => sum + parseFloat(item.amount), 0)
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
    </>
  );
}

export default Dashboard;
