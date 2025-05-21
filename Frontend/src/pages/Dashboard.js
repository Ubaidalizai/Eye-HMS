import { useState, useMemo, useEffect } from 'react';
import useFetchData from '../components/useFetchData';
import BarChart from '../components/BarChart';
import { Filters } from '../components/Filters';
import SummaryCard from '../components/SummaryCard';
import MoveHistory from './MoveHistory';
import PharmacyLogs from '../components/PharmacyLogs';
import { BASE_URL } from '../config';
import { useAuth } from '../AuthContext';

const API_BASE_URL = `${BASE_URL}`;

const constantCategories = [
  'drug',
  'sunglasses',
  'glass',
  'frame',
  'oct',
  'opd',
  'laboratory',
  'bedroom',
  'ultrasound',
  'operation',
  'yeglizer',
];

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
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedModel, setSelectedModel] = useState('sales');

  const dashboardSummary = useFetchData(
    `${API_BASE_URL}/dashboard/summary`,
    []
  );

  const { categories } = useAuth();

  // Combine constant categories with dynamic ones from useAuth, removing duplicates
  const allCategories = useMemo(() => {
    // Get category names from the dynamic categories
    const dynamicCategoryNames = categories.map((cat) => cat.name);

    // Create a Set to remove duplicates (case-insensitive)
    const uniqueCategories = new Set([
      ...constantCategories.map((cat) => cat.toLowerCase()),
      ...dynamicCategoryNames.map((cat) => cat.toLowerCase()),
    ]);

    // Convert back to array and restore original casing
    const allCats = Array.from(uniqueCategories).map((lowerCat) => {
      // First check if it exists in constantCategories with original casing
      const constCat = constantCategories.find(
        (c) => c.toLowerCase() === lowerCat
      );
      if (constCat) return constCat;

      // Then check if it exists in dynamic categories with original casing
      const dynamicCat = dynamicCategoryNames.find(
        (c) => c.toLowerCase() === lowerCat
      );
      if (dynamicCat) return dynamicCat;

      // Fallback to the lowercase version (should rarely happen)
      return lowerCat;
    });

    return allCats;
  }, [categories]);

  // Convert to react-select format
  const categoryOptions = useMemo(
    () =>
      allCategories.map((cat) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize first letter
        value: cat,
      })),
    [allCategories]
  );

  const stats = useFetchData(
    summaryType === 'monthly'
      ? `${API_BASE_URL}/${selectedModel}/${selectedYear}/${selectedMonth}?category=${selectedCategory}`
      : `${API_BASE_URL}/${selectedModel}/${selectedYear}/?category=${selectedCategory}`,
    [selectedCategory, selectedMonth, selectedYear, summaryType, selectedModel]
  );

  const getBarChartData = useMemo(() => {
    const labels =
      summaryType === 'yearly'
        ? monthLabels
        : Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const data =
      stats?.data || Array(summaryType === 'yearly' ? 12 : 30).fill(0);

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
  }, [stats, summaryType, selectedModel]);

  const getDoughnutChartData = useMemo(() => {
    // Filter out categories with no data to make the chart more readable
    const categoriesWithData = allCategories.filter((category) => {
      const categoryData = (stats?.data || [])
        .filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        )
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
      return categoryData > 0;
    });

    // Get data for each category
    const data = categoriesWithData.map((category) =>
      (stats?.data || [])
        .filter(
          (item) => item.category?.toLowerCase() === category.toLowerCase()
        )
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
    );

    // Generate more colors if needed
    const generateColors = (count) => {
      const baseColors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#4BC0C0',
        '#7ED321',
        '#50E3C2',
        '#B8E986',
      ];
      if (count <= baseColors.length) return baseColors.slice(0, count);

      // If we need more colors, generate them
      const colors = [...baseColors];
      for (let i = baseColors.length; i < count; i++) {
        const hue = (i * 137.5) % 360; // Use golden ratio to spread colors
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      return colors;
    };

    // Format labels to be more readable (capitalize first letter)
    const formattedLabels = categoriesWithData.map(
      (cat) => cat.charAt(0).toUpperCase() + cat.slice(1)
    );

    return {
      labels: formattedLabels,
      datasets: [
        {
          data,
          backgroundColor: generateColors(categoriesWithData.length),
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [stats, allCategories]);

  return (
    <div className='px-4 sm:px-6 py-6 max-w-full'>
      <h1 className='text-2xl sm:text-3xl font-bold text-gray-800 mb-6'>
        Dashboard
      </h1>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6'>
        {dashboardSummary && (
          <>
            <SummaryCard
              title='Total Sales'
              value={dashboardSummary.data.totalSales}
            />
            <SummaryCard
              title='Total Purchase'
              value={dashboardSummary.data.totalPurchases}
            />
            <SummaryCard
              title='Total Products'
              value={dashboardSummary.data.totalProductsCount}
            />
            <SummaryCard
              title='Total Expense'
              value={dashboardSummary.data.totalExpenses}
            />
            <SummaryCard
              title='Total Net Income'
              value={dashboardSummary.data.totalIncome}
            />
          </>
        )}
      </div>

      {/* Filters Section */}
      <div className='mt-8 mb-6'>
        <Filters
          categories={categoryOptions}
          models={models}
          monthLabels={monthLabels}
          summaryType={summaryType}
          selectedCategory={selectedCategory}
          selectedModel={selectedModel}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedCategory={setSelectedCategory}
          setSelectedModel={setSelectedModel}
          setSummaryType={setSummaryType}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
        />
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 gap-6 mb-8'>
        <BarChart
          data={getBarChartData}
          title={`${summaryType} Summary for ${selectedModel}`}
        />
      </div>

      {/* Tables Section */}
      <div className='space-y-8'>
        <MoveHistory />
        <PharmacyLogs />
      </div>
    </div>
  );
}

export default Dashboard;
