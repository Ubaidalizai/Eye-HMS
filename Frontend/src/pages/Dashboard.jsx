import { useState, useMemo } from 'react';
import useFetchData from '../components/useFetchData';
import BarChart from "../components/BarChart.jsx";
import IncomeCategoryChart from "../components/IncomeCategoryChart.jsx";
import { Filters } from "../components/Filters.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import MoveHistory from "./MoveHistory.jsx";
import PharmacyLogs from "../components/PharmacyLogs.jsx";
import DailySummaryTable from "../components/DailySummaryTable.jsx";
import { BASE_URL } from '../config';
import { useAuth } from "../AuthContext.jsx";

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
  'perimetry',
  'FA',
  'PRP',
];

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
  const [selectedModel, setSelectedModel] = useState('income');

  const dashboardSummary = useFetchData(
    `${API_BASE_URL}/dashboard/summary`,
    []
  );

  const { categories } = useAuth();

  // Filter categories based on the selected model (income/expense)
  const filteredCategories = useMemo(() => {
    // For income charts, only show income categories
    if (selectedModel === 'income') {
      return categories.filter((cat) => cat.type === 'income');
    }
    // For other models, show all categories (or filter by expense if needed)
    return categories;
  }, [categories, selectedModel]);

  // Combine constant categories with filtered dynamic ones from useAuth, removing duplicates
  const allCategories = useMemo(() => {
    // Get category names from the filtered dynamic categories
    const dynamicCategoryNames = filteredCategories.map((cat) => cat.name);

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

      // Then check if it exists in filtered dynamic categories with original casing
      const dynamicCat = dynamicCategoryNames.find(
        (c) => c.toLowerCase() === lowerCat
      );
      if (dynamicCat) return dynamicCat;

      // Fallback to the lowercase version (should rarely happen)
      return lowerCat;
    });

    return allCats;
  }, [filteredCategories]);

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

  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getBarChartData = useMemo(() => {
    let labels, data;

    if (summaryType === 'yearly') {
      // For yearly summary, use month labels
      labels = monthLabels;
      data = stats?.data || Array(12).fill(0);
    } else {
      // For monthly summary, dynamically calculate the number of days
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
      labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);

      // If we have data, use it; otherwise create an array of zeros with the correct length
      data = stats?.data || Array(daysInMonth).fill(0);

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
          label: selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1),
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  }, [stats, summaryType, selectedModel, selectedYear, selectedMonth]);

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

      {/* Daily Summary Table */}
      <div className='mt-8 mb-6'>
        <DailySummaryTable />
      </div>

      {/* Filters Section */}
      <div className='mt-8 mb-6'>
        <Filters
          categories={categoryOptions}
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
      <div className='space-y-6 mb-8'>
        {/* Bar Chart - Full Width */}
        <div className='w-full'>
          <BarChart
            data={getBarChartData}
            title={`${
              summaryType === 'yearly'
                ? `Yearly Summary for ${selectedModel} (${selectedYear})`
                : `Monthly Summary for ${selectedModel} (${
                    monthLabels[selectedMonth - 1]
                  } ${selectedYear})`
            }`}
          />
        </div>

        {/* Income Category Pie Chart - Only show for income model */}
        {selectedModel === 'income' && (
          <div className='w-full'>
            <IncomeCategoryChart
              title="Income by Category"
              className="w-full"
            />
          </div>
        )}
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


