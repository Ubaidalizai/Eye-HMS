import { useState, useEffect, useContext } from 'react';
import PieChart from './PieChart.jsx';
import { BASE_URL } from '../config';
import AuthContext from '../AuthContext.jsx';

const IncomeCategoryChart = ({
  title = 'Income by Category',
  className = ''
}) => {
  const authContext = useContext(AuthContext);
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // Independent filter states
  const [summaryType, setSummaryType] = useState('yearly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Fetch income category data
  const fetchIncomeCategoryData = async () => {
    setLoading(true);
    setError(null);
    setAccessDenied(false);
    
    try {
      let url = `${BASE_URL}/income/categories/totals`;
      
      // Add query parameters based on summary type
      const params = new URLSearchParams();
      if (summaryType === 'yearly') {
        params.append('year', selectedYear);
      } else {
        params.append('year', selectedYear);
        params.append('month', selectedMonth);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          setAccessDenied(true);
          setIncomeData([]);
          return;
        }
        throw new Error(`Failed to fetch income category data: ${response.status}`);
      }

      const result = await response.json();
      setIncomeData(result.data || []);
    } catch (err) {
      console.error('Error fetching income category data:', err);
      setError(err.message);
      setIncomeData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeCategoryData();
  }, [summaryType, selectedYear, selectedMonth]);

  // Generate years for dropdown (current year and 4 years back)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Generate months
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];



  // Generate dynamic title based on selected filters
  const dynamicTitle = () => {
    if (summaryType === 'yearly') {
      return `${title} (${selectedYear})`;
    } else {
      const monthName = months.find(m => m.value === selectedMonth)?.label || '';
      return `${title} (${monthName} ${selectedYear})`;
    }
  };

  return (
    <div className={className}>
      {/* Pie Chart with integrated filters */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        {/* Header with Title and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 lg:mb-0">
            {dynamicTitle()}
          </h3>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Summary Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Period
              </label>
              <select
                value={summaryType}
                onChange={(e) => setSummaryType(e.target.value)}
                className="w-44 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-44 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Month (only show if monthly) */}
            {summaryType === 'monthly' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Chart Content */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        ) : accessDenied ? (
          <div className="text-center py-8">
            <div className="text-blue-500 mb-2">
              <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Income Category Analytics
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Income category data and analytics are available for administrators only.
            </div>
            <div className="text-xs text-gray-500">
              Contact your administrator for access to financial reports.
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">⚠️ Error loading chart</div>
            <div className="text-sm text-gray-600">{error}</div>
            <button
              onClick={fetchIncomeCategoryData}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <PieChart
            data={incomeData}
            title=""
            showLegend={true}
            showLabels={true}
            size={320}
          />
        )}
      </div>
    </div>
  );
};

export default IncomeCategoryChart;
