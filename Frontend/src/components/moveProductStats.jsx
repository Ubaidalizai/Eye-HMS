import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { BASE_URL } from '../config';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

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

// Generate year options from 2022 to current year
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2022; // Starting year for the application
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
};

const MoveProductStats = () => {
  const [summaryType, setSummaryType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    if (summaryType === 'monthly') {
      fetchMonthlyDrugMovement();
    } else {
      fetchYearlyDrugMovement();
    }
  }, [selectedMonth, selectedYear, summaryType]);

  const fetchMonthlyDrugMovement = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/move-product/${selectedYear}/${selectedMonth}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.data); // Assuming the backend returns a "summary" field
    } catch (err) {
      console.log(err);
    }
  };

  const fetchYearlyDrugMovement = async () => {
    try {
      const response = await fetch(`${BASE_URL}/move-product/${selectedYear}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.data); // Assuming the backend returns a "summary" field
    } catch (err) {
      console.log(err);
    }
  };

  const handleSummaryTypeChange = (e) => {
    setSummaryType(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(Number(e.target.value));
    // Refetch data when month changes
    fetchMonthlyDrugMovement();
  };

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
    // Refetch data when year changes
    if (summaryType === 'monthly') {
      fetchMonthlyDrugMovement();
    } else {
      fetchYearlyDrugMovement();
    }
  };

  // Function to get the number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getBarChartData = () => {
    let labels, data;

    if (summaryType === 'yearly') {
      // For yearly summary, use month labels
      labels = monthLabels;
      data = summary || Array(12).fill(0);
    } else {
      // For monthly summary, dynamically calculate the number of days
      const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
      labels = Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`);

      // If we have data, use it; otherwise create an array of zeros with the correct length
      data = summary || Array(daysInMonth).fill(0);

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
          label: 'Amount',
          data,
          backgroundColor: 'rgb(0, 179, 255)',
          borderColor: 'rgb(0, 179, 255)',
          borderWidth: 1,
        },
      ],
    };
  };
  return (
    <div className='bg-white border rounded-lg shadow-sm p-4 sm:p-6 mb-6'>
      <h2 className='text-lg sm:text-xl font-semibold text-gray-800 mb-4'>
        Drug Movement Amount Summary
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <div>
          <label
            htmlFor='summary-type'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Summary Type
          </label>
          <select
            id='summary-type'
            className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            onChange={handleSummaryTypeChange}
            value={summaryType}
          >
            <option value='monthly'>Monthly Summary</option>
            <option value='yearly'>Yearly Summary</option>
          </select>
        </div>
        {summaryType === 'monthly' && (
          <div>
            <label
              htmlFor='month-select'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Select Month
            </label>
            <select
              id='month-select'
              className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
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
        {/* Always show Year filter for both yearly and monthly views */}
        <div>
          <label
            htmlFor='year-select'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Select Year
          </label>
          <select
            id='year-select'
            className='w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            value={selectedYear}
            onChange={handleYearChange}
          >
            {generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className='w-full h-[300px] sm:h-[350px] lg:h-[400px]'>
        <Bar
          data={getBarChartData()}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  boxWidth: 12,
                  padding: 15,
                  font: {
                    size: 12,
                  },
                },
              },
              title: {
                display: true,
                text:
                  summaryType === 'yearly'
                    ? `Yearly Summary (${selectedYear})`
                    : `Monthly Summary (${
                        monthLabels[selectedMonth - 1]
                      } ${selectedYear})`,
                font: {
                  size: 14,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
              x: {
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default MoveProductStats;
