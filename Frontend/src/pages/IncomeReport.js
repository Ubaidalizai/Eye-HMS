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

const transactions = [
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
  // Helper functions
  function filterTransactionsByDate(transactions, startDate, endDate) {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

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
      totalIncome:
        dailyReport.totalIncome +
        monthlyReport.totalIncome +
        annualReport.totalIncome,
    };
  }

  const IncomeDetailReport = ({ report, title }) => {
    const {
      totalIncome,
      transactionsCount,
      sourcesBreakdown = {},
      transactions,
    } = report;

    // Check if sourcesBreakdown has valid keys
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

  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const comprehensiveReport = generateComprehensiveReport(
      transactions,
      2024,
      9
    );
    setReportData(comprehensiveReport);
  }, []);
  console.log(reportData);
  return (
    <div className={styles.container}>
      {reportData && (
        <>
          <IncomeDetailReport report={reportData.dailyReport} title='Daily' />
          <IncomeDetailReport
            report={reportData.monthlyReport}
            title='Monthly'
          />
          <IncomeDetailReport report={reportData.annualReport} title='Annual' />
          <h2>
            Total Combined Income: <strong>${reportData.totalIncome}</strong>
          </h2>
        </>
      )}
    </div>
  );
};

export default IncomeReport;
