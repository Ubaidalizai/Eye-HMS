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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); //

  // Function to get last 5 years
  const getLastFiveYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, index) => currentYear - index);
  };

  // Function to handle year selection
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedReport('Yearly'); // Switch to yearly report view
  };

  // Helper function to filter transactions based on date range
  function filterTransactionsByDate(transactions, startDate, endDate) {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  // Calculate Daily Income
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

  // Calculate Monthly Income
  function calculateMonthlyIncome(transactions, year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const monthlyTransactions = filterTransactionsByDate(
      transactions,
      startOfMonth,
      endOfMonth
    );
    return generateReport(monthlyTransactions, 'Monthly');
  }

  // Calculate Annual Income
  function calculateAnnualIncome(transactions, year) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    const annualTransactions = filterTransactionsByDate(
      transactions,
      startOfYear,
      endOfYear
    );
    return generateReport(annualTransactions, 'Annual');
  }

  // Generate Report based on the filtered transactions
  function generateReport(transactions, reportType) {
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
  const IncomeDetailReport = ({ report, title }) => {
    const {
      totalIncome,
      transactionsCount,
      sourcesBreakdown = {},
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
      labels: transactions.map((tx) => tx.date),
      datasets: [
        {
          label: 'Income Over Time',
          data: transactions.map((tx) => tx.amount),
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
        {Object.keys(sourcesBreakdown).length > 0 ? (
          <Bar data={barData} options={{ responsive: true }} />
        ) : (
          <p>No data available for income by source.</p>
        )}

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
                <td>{tx.date}</td>
                <td>${tx.amount}</td>
                <td>{tx.source}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Income Over Time</h3>
        <Line data={lineData} />
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
      id: transactions.length + 1,
      date: newTransaction.date,
      amount: parseFloat(newTransaction.amount),
      source: newTransaction.source,
      description: newTransaction.description,
    };

    // Update transactions state
    setTransactions([...transactions, newTx]);

    // Reset newTransaction state for the form inputs
    setNewTransaction({
      date: '',
      amount: '',
      source: '',
      description: '',
    });
  };

  // Handle month button click
  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setSelectedReport('Monthly'); // Switch to monthly report
  };

  // Array of month names
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

  return (
    <div className={styles.container}>
      <div className={styles.buttonsContainer}>
        <button onClick={() => setSelectedReport('Daily')}>Daily Report</button>
        <button onClick={() => setSelectedReport('Monthly')}>
          Monthly Report
        </button>
        <button onClick={() => setSelectedReport('Annual')}>
          Annual Report
        </button>
      </div>

      {/* Month buttons for the monthly report */}
      {selectedReport === 'Monthly' && (
        <div className={styles.monthButtons}>
          {monthNames.map((month, index) => (
            <button
              key={index}
              onClick={() => handleMonthClick(index + 1)}
              className={selectedMonth === index + 1 ? styles.activeMonth : ''}
            >
              {month}
            </button>
          ))}
        </div>
      )}

      {/* Year buttons for the annual report */}
      {selectedReport === 'Annual' && (
        <div className={styles.yearButtons}>
          {getLastFiveYears().map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={selectedYear === year ? styles.activeYear : ''}
            >
              {year}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleAddTransaction}>
        <input
          type='date'
          value={newTransaction.date}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, date: e.target.value })
          }
        />
        <input
          type='number'
          value={newTransaction.amount}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, amount: e.target.value })
          }
        />
        <input
          type='text'
          value={newTransaction.source}
          onChange={(e) =>
            setNewTransaction({ ...newTransaction, source: e.target.value })
          }
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
        />
        <button type='submit'>Add Transaction</button>
      </form>

      {reportData && (
        <>
          {selectedReport === 'Daily' && (
            <IncomeDetailReport report={reportData.dailyReport} title='Daily' />
          )}
          {selectedReport === 'Monthly' && (
            <IncomeDetailReport
              report={calculateMonthlyIncome(
                transactions,
                new Date().getFullYear(),
                selectedMonth
              )}
              title='Monthly'
            />
          )}
          {selectedReport === 'Annual' && (
            <IncomeDetailReport
              report={reportData.annualReport}
              title='Annual'
            />
          )}
          {selectedReport === 'Yearly' && (
            <IncomeDetailReport
              report={calculateAnnualIncome(transactions, selectedYear)}
              title={`Monthly Report for ${selectedYear}`}
            />
          )}
        </>
      )}
    </div>
  );
};

export default IncomeReport;
