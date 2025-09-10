import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';
import { FaPrint, FaCalendarAlt, FaFilter } from 'react-icons/fa';

const DailySummaryTable = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch daily summaries
  const fetchSummaries = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/daily-summary/range?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetch response:', data);
      setSummaries(data.data || []);
    } catch (err) {
      console.error('Error fetching daily summaries:', err);
      setError(err.message);
      setSummaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh for invalid date range
  const handleRefresh = () => {
    // Reset to last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    setError(null);
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (start > end) {
        setError('Start date must be before or equal to end date');
        setSummaries([]);
      } else if (daysDiff > 31) {
        setError('Date range cannot exceed 31 days');
        setSummaries([]);
      } else {
        setError(null);
        fetchSummaries();
      }
    }
  }, [startDate, endDate]);

  // Handle print functionality
  const handlePrint = (summary) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Summary - ${summary.date}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .date { font-size: 18px; font-weight: bold; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .totals { background-color: #e8f4fd; font-weight: bold; }
            .category { text-transform: capitalize; }
            .number { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Al-Sayed Eye Hospital</h1>
            <h2>Daily Summary Report</h2>
            <div class="date">Date: ${new Date(
              summary.date
            ).toLocaleDateString()}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Records Count</th>
                <th>Sales Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(summary.categories)
                .map(
                  ([category, data]) => `
                <tr>
                  <td class="category">${
                    category === 'Bscan'
                      ? 'B-Scan'
                      : category.replace(/([A-Z])/g, ' $1').trim()
                  }</td>
                  <td class="number">${data.count}</td>
                  <td class="number">${data.totalSales.toLocaleString()}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="totals">
                <td><strong>TOTAL</strong></td>
                <td class="number"><strong>${
                  summary.totals.totalRecords
                }</strong></td>
                <td class="number"><strong>${summary.totals.totalSales.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Format category name for display
  const formatCategoryName = (category) => {
    const categoryNames = {
      opd: 'OPD',
      oct: 'OCT',
      laboratory: 'Laboratory',
      bedroom: 'Bedroom',
      ultrasound: 'B-Scan',
      operation: 'Operation',
      yeglizer: 'Yeglizer',
      perimetry: 'Perimetry',
      fa: 'FA',
      prp: 'PRP',
      glasses: 'Glasses',
      pharmacy: 'Pharmacy',
    };
    return (
      categoryNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1)
    );
  };

  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='flex justify-center items-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          <span className='ml-3 text-gray-600'>Loading daily summaries...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm p-6'>
        <div className='text-center py-8'>
          <div className='text-red-500 text-lg font-medium'>
            Error loading data
          </div>
          <div className='text-gray-600 mt-2'>{error}</div>
          <button
            onClick={handleRefresh}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
            <FaCalendarAlt className='mr-2 text-blue-600' />
            Daily Summary Records
          </h3>

          {/* Date Filter */}
          <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
            <FaFilter className='text-gray-400 mt-2 sm:mt-0' />
            <div className='flex flex-col sm:flex-row gap-2'>
              <input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <span className='text-gray-500 self-center'>to</span>
              <input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date
              </th>
              {Object.keys(summaries[0]?.categories || {}).map((category) => (
                <th
                  key={category}
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap'
                >
                  {category === 'Bscan' ? 'B-Scan' : formatCategoryName(category)}
                </th>
              ))}
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total Records
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Total Sales
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className='bg-white divide-y divide-gray-200'>
            {summaries.map((summary, index) => (
              <tr key={index} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {new Date(summary.date).toLocaleDateString()}
                </td>
                {Object.entries(summary.categories).map(([category, data]) => (
                  <td
                    key={category}
                    className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'
                  >
                    <div className='flex flex-col'>
                      <span className='font-medium'>{data.count}</span>
                      <span className='text-xs text-gray-500'>
                        {data.totalSales.toLocaleString()}
                      </span>
                    </div>
                  </td>
                ))}
                <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                  {summary.totals.totalRecords}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600'>
                  {summary.totals.totalSales.toLocaleString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  <button
                    onClick={() => handlePrint(summary)}
                    className='inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                  >
                    <FaPrint className='mr-1' />
                    Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summaries.length === 0 && !loading && (
        <div className='text-center py-8 text-gray-500'>
          No data available for the selected date range
        </div>
      )}
    </div>
  );
};

export default DailySummaryTable;
