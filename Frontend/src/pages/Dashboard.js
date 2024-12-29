import React, { useContext, useEffect, useState, useMemo } from 'react';
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
import MoveHistory from './MoveHistory';
import PersonInfoDropdown from './PersonInfoDropdown';
import SummaryCard from '../components/SummaryCard';
import SelectInput from '../components/SelectInput';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const API_BASE_URL = 'http://localhost:4000/api/v1';

const categories = ['drug', 'sunglasses', 'glass', 'frame'];
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
    fetchStats();
  }, [
    selectedCategory,
    selectedMonth,
    selectedYear,
    summaryType,
    selectedModel,
  ]);

  const fetchStats = async () => {
    try {
      const endpoint =
        summaryType === 'monthly'
          ? `${API_BASE_URL}/${selectedModel}/${selectedYear}/${selectedMonth}?category=${selectedCategory}`
          : `${API_BASE_URL}/${selectedModel}/${selectedYear}/?category=${selectedCategory}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      toast.error('Failed to fetch stats');
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setDashboardSummary(data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
      toast.error('Failed to fetch dashboard summary');
    }
  };

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  const getBarChartData = useMemo(() => {
    const labels =
      summaryType === 'yearly'
        ? monthLabels
        : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const data =
      summary.data || Array(summaryType === 'yearly' ? 12 : 30).fill(0);

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
  }, [summary, summaryType, selectedModel]);

  const getDoughnutChartData = useMemo(() => {
    const data = categories.map((category) =>
      (summary?.data || [])
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
    );

    return {
      labels: categories,
      datasets: [
        {
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    };
  }, [summary, categories]);

  return (
    <>
      <div className='grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-5'>
        <SummaryCard
          title='Total Sales'
          value={dashboardSummary.totalSales}
          trend={67.81}
          trendDirection='up'
        />
        <SummaryCard
          title='Purchase'
          value={dashboardSummary.totalPurchases}
          trend={67.81}
          trendDirection='down'
        />
        <SummaryCard
          title='Total Products'
          value={dashboardSummary.totalProductsCount}
          trend={67.81}
          trendDirection='down'
        />
        <SummaryCard
          title='Total Expense'
          value={dashboardSummary.totalExpenses}
          trend={67.81}
          trendDirection='down'
        />
        <SummaryCard
          title='Total Net Income'
          value={dashboardSummary.totalIncome}
          trend={67.81}
          trendDirection='down'
        />
      </div>

      <div className=' flex flex-col gap-4'>
        <div className='flex mt-10 justify-between flex-wrap gap-4'>
          <SelectInput
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            value={selectedCategory}
            onChange={handleInputChange(setSelectedCategory)}
          />
          <SelectInput
            options={models.map((m) => ({
              value: m,
              label: m.charAt(0).toUpperCase() + m.slice(1),
            }))}
            value={selectedModel}
            onChange={handleInputChange(setSelectedModel)}
          />
          <SelectInput
            options={[
              { value: 'monthly', label: 'Monthly Summary' },
              { value: 'yearly', label: 'Yearly Summary' },
            ]}
            value={summaryType}
            onChange={handleInputChange(setSummaryType)}
          />
          {summaryType === 'monthly' && (
            <SelectInput
              options={monthLabels.map((label, index) => ({
                value: index + 1,
                label,
              }))}
              value={selectedMonth}
              onChange={handleInputChange(setSelectedMonth)}
            />
          )}
          {summaryType === 'yearly' && (
            <input
              className='w-52 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='number'
              value={selectedYear}
              onChange={handleInputChange(setSelectedYear)}
              min='2000'
              max={new Date().getFullYear()}
            />
          )}
        </div>

        <div className='p-4 border rounded-md bg-white'>
          <h2 className='text-xl font-bold mb-4'>
            {`${
              summaryType.charAt(0).toUpperCase() + summaryType.slice(1)
            } Summary for ${
              selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)
            }`}
          </h2>
          <Bar
            data={getBarChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
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

        <div className='p-4 border rounded-md  bg-white'>
          <h2 className='text-xl font-bold mb-4'>
            {`${
              selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)
            } by Category`}
          </h2>
          <div className='w-full max-w-md mx-auto'>
            <Doughnut data={getDoughnutChartData} />
          </div>
        </div>

        <MoveHistory />
      </div>
    </>
  );
}

export default Dashboard;
