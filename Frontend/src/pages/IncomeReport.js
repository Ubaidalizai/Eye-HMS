import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './Income.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Initial data
const initialTransactions = [
  {
    id: 1,
    date: '2024-09-29',
    amount: 600,
    source: 'Sales',
    description: 'Sale A',
  },
  {
    id: 2,
    date: '2024-09-29',
    amount: 150,
    source: 'Service',
    description: 'Consulting',
  },
  {
    id: 3,
    date: '2024-09-01',
    amount: 300,
    source: 'Sales',
    description: 'Sale B',
  },
  {
    id: 4,
    date: '2024-08-15',
    amount: 400,
    source: 'Service',
    description: 'Maintenance',
  },
];

const monthNames = [
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

const IncomeReport = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedReport, setSelectedReport] = useState('Daily');
  const [reportData, setReportData] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    amount: '',
    source: '',
    description: '',
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Function to get last 5 years
  const getLastFiveYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => currentYear - index);
  };

  // Function to handle year selection
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedReport('Annual'); // Switch to yearly report view
  };

  // Helper function to filter transactions based on date range
  function filterTransactionsByDate(transactions, startDate, endDate) {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Calculate Daily Income (for a specific date)
  function calculateDailyIncome(transactions, targetDate = new Date()) {
    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dailyTransactions = filterTransactionsByDate(
      transactions,
      today,
      tomorrow
    );
    return generateReport(dailyTransactions, 'Daily');
  }

  // Calculate Monthly Income (aggregate income for each day in the selected month)
  function calculateMonthlyIncome(transactions, year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const monthlyTransactions = filterTransactionsByDate(
      transactions,
      startOfMonth,
      endOfMonth
    );
    const incomeByDay = Array.from({ length: endOfMonth.getDate() }, (_, i) => {
      const day = i + 1;
      const dailyIncome = monthlyTransactions
        .filter((tx) => new Date(tx.date).getDate() === day)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return dailyIncome;
    });
    return generateReport(monthlyTransactions, 'Monthly', incomeByDay);
  }

  // Calculate Annual Income (aggregate income for each month)
  function calculateAnnualIncome(transactions, year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const annualTransactions = filterTransactionsByDate(
      transactions,
      startOfYear,
      endOfYear
    );
    const incomeByMonth = monthNames.map((_, monthIndex) => {
      const monthlyIncome = annualTransactions
        .filter((tx) => new Date(tx.date).getMonth() === monthIndex)
        .reduce((sum, tx) => sum + tx.amount, 0);
      return monthlyIncome;
    });
    return generateReport(annualTransactions, 'Annual', incomeByMonth);
  }

  // Generate Report based on the filtered transactions
  function generateReport(transactions, reportType, incomeData = []) {
    const totalIncome = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const sourcesBreakdown = transactions.reduce((sources, tx) => {
      sources[tx.source] = (sources[tx.source] || 0) + tx.amount;
      return sources;
    }, {});
    return {
      reportType,
      totalIncome,
      transactionsCount: transactions.length,
      sourcesBreakdown,
      incomeData,
      transactions,
    };
  }

  // Generate Comprehensive Report (Daily, Monthly, and Annual)
  function generateComprehensiveReport(
    transactions,
    year,
    month,
    date = new Date()
  ) {
    const dailyReport = calculateDailyIncome(transactions, date);
    const monthlyReport = calculateMonthlyIncome(transactions, year, month);
    const annualReport = calculateAnnualIncome(transactions, year);
    return {
      dailyReport,
      monthlyReport,
      annualReport,
    };
  }

  // Component for displaying the report
  const IncomeDetailReport = ({ report, title, selectedReport }) => {
    const {
      totalIncome,
      transactionsCount,
      sourcesBreakdown = {},
      incomeData,
      transactions,
    } = report;

    const barData = {
      labels: Object.keys(sourcesBreakdown),
      datasets: [
        {
          label: 'Income by Source',
          data: Object.values(sourcesBreakdown),
          backgroundColor: ['#4caf50', '#ff5722', '#03a9f4', '#e91e63'],
        },
      ],
    };

    const lineData = {
      labels:
        selectedReport === 'Daily'
          ? [new Date().toDateString()]
          : selectedReport === 'Monthly'
          ? Array.from({ length: incomeData.length }, (_, i) => i + 1) // Days of the month
          : monthNames, // Months of the year
      datasets: [
        {
          label: `Income Over Time (${selectedReport})`,
          data: incomeData,
          fill: false,
          backgroundColor: '#03a9f4',
          borderColor: '#03a9f4',
        },
      ],
    };

    return (
      <div className={styles.reportContainer}>
        <h2>{title} Income Report</h2>
        <p>
          <strong>Total Income:</strong> ${totalIncome}
        </p>
        <p>
          <strong>Number of Transactions:</strong> {transactionsCount}
        </p>

        <h3>Income by Source</h3>
        <div className={styles.chartContainer}>
          {Object.keys(sourcesBreakdown).length > 0 ? (
            <Bar
              data={barData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          ) : (
            <p>No data available for income by source.</p>
          )}
        </div>
        <h3>Transactions</h3>
        <table className={styles.transactionsTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Source</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td data-label='Date'>{tx.date}</td>
                <td data-label='Amount'>${tx.amount}</td>
                <td data-label='Source'>{tx.source}</td>
                <td data-label='Description'>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Income Over Time</h3>
        <div className={styles.chartContainer}>
          <Line
            data={lineData}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    );
  };

  // Use effect to generate reports when transactions change
  useEffect(() => {
    const date = new Date();
    const comprehensiveReport = generateComprehensiveReport(
      transactions,
      date.getFullYear(),
      date.getMonth() + 1
    );
    setReportData(comprehensiveReport);
  }, [transactions]);

  // Handle new transaction submission
  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTx = {
      ...newTransaction,
      id: transactions.length + 1,
      amount: parseFloat(newTransaction.amount),
    };
    setTransactions([...transactions, newTx]);
    setNewTransaction({ date: '', amount: '', source: '', description: '' });
  };

  return (
    <div className={styles.container}>
      <h1>Income Report</h1>

      <div className={styles.buttonContainer}>
        <button onClick={() => setSelectedReport('Daily')}>Daily</button>
        <button onClick={() => setSelectedReport('Monthly')}>Monthly</button>
        <button onClick={() => setSelectedReport('Annual')}>Annual</button>
      </div>
      <div className={styles.addTransaction}>
        <h2>Add New Transaction</h2>
        <form onSubmit={handleAddTransaction}>
          <input
            type='date'
            value={newTransaction.date}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, date: e.target.value })
            }
            required
          />
          <input
            type='number'
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, amount: e.target.value })
            }
            placeholder='Amount'
            required
          />
          <input
            type='text'
            value={newTransaction.source}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, source: e.target.value })
            }
            placeholder='Source'
            required
          />
          <input
            type='text'
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
            placeholder='Description'
            required
          />
          <button type='submit'>Add Transaction</button>
        </form>
      </div>

      {selectedReport === 'Daily' && reportData && (
        <IncomeDetailReport
          report={reportData.dailyReport}
          title='Daily'
          selectedReport='Daily'
        />
      )}

      {selectedReport === 'Monthly' && reportData && (
        <div>
          <h3>Monthly Income Report for {monthNames[selectedMonth - 1]}</h3>
          <div className={styles.monthNavigation}>
            <button
              onClick={() => setSelectedMonth((prev) => Math.max(1, prev - 1))}
              disabled={selectedMonth === 1}
            >
              Previous Month
            </button>
            <button
              onClick={() => setSelectedMonth((prev) => Math.min(12, prev + 1))}
              disabled={selectedMonth === 12}
            >
              Next Month
            </button>
          </div>
          <IncomeDetailReport
            report={calculateMonthlyIncome(
              transactions,
              selectedYear,
              selectedMonth
            )}
            title='Monthly'
            selectedReport='Monthly'
          />
        </div>
      )}

      {selectedReport === 'Annual' && reportData && (
        <div>
          <h3>Annual Income Report for {selectedYear}</h3>
          <div className={styles.yearNavigation}>
            {getLastFiveYears().map((year) => (
              <button key={year} onClick={() => handleYearClick(year)}>
                {year}
              </button>
            ))}
          </div>
          <IncomeDetailReport
            report={calculateAnnualIncome(transactions, selectedYear)}
            title='Annual'
            selectedReport='Annual'
          />
        </div>
      )}
    </div>
  );
};

export default IncomeReport;
