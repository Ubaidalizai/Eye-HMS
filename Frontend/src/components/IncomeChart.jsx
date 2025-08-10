import { useState, useEffect, useMemo } from 'react';
import BarChart from './BarChart.jsx';
import { BASE_URL } from '../config';

const IncomeChart = ({ 
  category = '', 
  title = 'Income Chart',
  defaultYear = new Date().getFullYear(),
  defaultMonth = new Date().getMonth() + 1,
  showFilters = true,
  summaryType: propSummaryType = 'yearly',
  className = ''
}) => {
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryType, setSummaryType] = useState(propSummaryType);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Fetch income data based on summary type
  const fetchIncomeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      if (summaryType === 'yearly') {
        url = `${BASE_URL}/income/${selectedYear}`;
      } else {
        url = `${BASE_URL}/income/${selectedYear}/${selectedMonth}`;
      }
      
      // Add category filter if provided
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch income data: ${response.status}`);
      }

      const result = await response.json();
      setIncomeData(result.data || []);
    } catch (err) {
      console.error('Error fetching income data:', err);
      setError(err.message);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, [summaryType, selectedYear, selectedMonth, category]);

  // Generate chart data
  const chartData = useMemo(() => {
    let labels, data;

    if (summaryType === 'yearly') {
      // For yearly summary, use month labels
      labels = monthLabels;
      data = incomeData;
    } else {
      // For monthly summary, use day labels
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      data = incomeData;
    }

    return {
      labels,
      datasets: [
        {
          label: `Income${category ? ` (${category})` : ''}`,
          data,
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green color for income
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [incomeData, summaryType, selectedYear, selectedMonth, category]);

  // Generate dynamic title
  const chartTitle = useMemo(() => {
    if (title !== 'Income Chart') return title;
    
    const categoryText = category ? ` - ${category}` : '';
    const periodText = summaryType === 'yearly' 
      ? `${selectedYear}` 
      : `${monthLabels[selectedMonth - 1]} ${selectedYear}`;
    
    return `Income Summary${categoryText} (${periodText})`;
  }, [title, category, summaryType, selectedYear, selectedMonth]);

  if (loading) {
    return (
      <div className={`p-4 sm:p-6 border rounded-lg shadow-sm bg-white ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 sm:p-6 border rounded-lg shadow-sm bg-white ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️ Error loading chart</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button 
            onClick={fetchIncomeData}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Summary Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Type
              </label>
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Month Filter (only show for monthly view) */}
            {summaryType === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthLabels.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      <BarChart data={chartData} title={chartTitle} />
    </div>
  );
};

export default IncomeChart;
