import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import './newManagement.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const categories = [
    'Operational Costs',
    'Staff Salaries',
    'Medical Supplies',
    'Marketing',
];

const monthLabels = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ amount: '', date: '', reason: '', category: '', id: null });
    const [summaryType, setSummaryType] = useState('monthly');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [showForm, setShowForm] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewExpense({ ...newExpense, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formattedDate = newExpense.date;

        if (newExpense.id) {
            setExpenses(expenses.map(expense =>
                expense.id === newExpense.id ? { ...newExpense, date: formattedDate } : expense
            ));
        } else {
            setExpenses([...expenses, { ...newExpense, date: formattedDate, id: Date.now() }]);
        }
        setNewExpense({ amount: '', date: '', reason: '', category: '', id: null });
        setShowForm(false);
        updateSummary();
    };

    const editExpense = (expense) => {
        setNewExpense(expense);
        setShowForm(true);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
        updateSummary();
    };

    const aggregateExpenses = () => {
        const monthlyData = Array(12).fill(0);
        const yearlyData = {};

        expenses.forEach(expense => {
            const date = new Date(expense.date);
            const amount = parseFloat(expense.amount);
            const month = date.getMonth(); // Zero-based index
            const year = date.getFullYear();

            // Aggregate for yearly summary
            if (summaryType === 'yearly') {
                if (!yearlyData[year]) {
                    yearlyData[year] = Array(12).fill(0); // Initialize months for the year
                }
                yearlyData[year][month] += amount; // Sum amount for the respective month
            }

            // Aggregate for monthly summary
            if (summaryType === 'monthly' && month + 1 === selectedMonth && year === selectedYear) {
                monthlyData[month] += amount; // Sum amount for the respective day
            }
        });

        return summaryType === 'yearly' ? yearlyData : monthlyData;
    };

    const updateSummary = () => {
        const newSummary = aggregateExpenses();
        setSummary(newSummary);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        updateSummary();
    };

    const handleSummaryTypeChange = (e) => {
        setSummaryType(e.target.value);
        updateSummary();
    };

    const handleMonthChange = (e) => {
        const month = Number(e.target.value);
        setSelectedMonth(month);
        updateSummary();
    };

    const handleYearChange = (e) => {
        const year = Number(e.target.value);
        setSelectedYear(year);
        updateSummary();
    };

    const getBarChartData = () => {
        let labels, data;

        if (summaryType === 'yearly') {
            labels = monthLabels; // Month names for the x-axis
            data = summary[selectedYear] || Array(12).fill(0); // Use data for the selected year or zeros
        } else {
            labels = Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`); // Days of the month
            data = summary; // Expenses for days
        }

        return {
            labels,
            datasets: [{
                label: 'Expenses',
                data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        };
    };

    return (
        <div className='parent'>
            <h1>Expense Management</h1>
            <button className="add-expense-button" onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : 'Add Expense'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="expense-form">
                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={newExpense.amount}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="date"
                        name="date"
                        value={newExpense.date}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="reason"
                        placeholder="Reason"
                        value={newExpense.reason}
                        onChange={handleChange}
                        required
                    />
                    <select name="category" value={newExpense.category} onChange={handleChange} required>
                        <option value="">Select Category</option>
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                    <button className='UpdateBtn' type="submit">{newExpense.id ? 'Update Expense' : 'Add Expense'}</button>
                </form>
            )}

            <div className='expense-list-detail'>
                <div className='summary-display'>
                    <h2>Expenses</h2>
                    <table className="expense-table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Reason</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No expenses added yet.</td>
                                </tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{expense.amount}</td>
                                        <td>{new Date(expense.date).toLocaleDateString()}</td>
                                        <td>{expense.reason}</td>
                                        <td>{expense.category}</td>
                                        <td>
                                            <button onClick={() => editExpense(expense)} className="edit-button">Edit</button>
                                            <button onClick={() => deleteExpense(expense.id)} className="delete-button">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='general-div'>
                    <div className='filter-category'>
                        <h2>Filter by Category</h2>
                        <select onChange={handleCategoryChange} value={selectedCategory}>
                            <option value="All Categories">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className='summery-type'>
                        <h2>Summary Type</h2>
                        <select onChange={handleSummaryTypeChange} value={summaryType}>
                            <option value="monthly">Monthly Summary</option>
                            <option value="yearly">Yearly Summary</option>
                        </select>
                    </div>
                    
                    {summaryType === 'monthly' && (
                        <div>
                            <h2>Select Month</h2>
                            <select onChange={handleMonthChange} value={selectedMonth}>
                                {monthLabels.map((label, index) => (
                                    <option key={index} value={index + 1}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {summaryType === 'yearly' && (
                        <div>
                            <h2>Select Year</h2>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={handleYearChange}
                                min="2000"
                                max={new Date().getFullYear()}
                            />
                        </div>
                    )}
                </div>

                <div className='summary-display'>
                    <h2>{summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary for {selectedCategory}</h2>
                    <Bar
                        data={getBarChartData()}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: `${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary for ${selectedCategory}`,
                                },
                            },
                        }}
                    />
                </div>

                <div className='chart'>
                    <h2>Expense by Category</h2>
                    <div className='graph'>
                        <Doughnut
                            data={{
                                labels: categories,
                                datasets: [{
                                    data: categories.map(category =>
                                        expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
                                    ),
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
                                }],
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseManagement;