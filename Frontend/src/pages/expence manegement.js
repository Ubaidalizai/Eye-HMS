import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './newManagement.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
    'Operational Costs',
    'Staff Salaries',
    'Medical Supplies',
    'Marketing',
];

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ amount: '', date: '', reason: '', category: '', id: null });
    const [summaryType, setSummaryType] = useState('monthly');
    const [summary, setSummary] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('All Categories'); // New state for category selection
    const [showForm, setShowForm] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(expenses.length / itemsPerPage);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewExpense({ ...newExpense, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newExpense.id) {
            setExpenses(expenses.map(expense =>
                expense.id === newExpense.id ? { ...newExpense } : expense
            ));
        } else {
            setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
        }
        setNewExpense({ amount: '', date: '', reason: '', category: '', id: null });
        setShowForm(false);
    };

    const editExpense = (expense) => {
        setNewExpense(expense);
        setShowForm(true);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    };

    const getSummary = (type, category = 'All Categories') => {
        const summary = {};
        const filteredExpenses = category === 'All Categories' ? expenses : expenses.filter(expense => expense.category === category);

        filteredExpenses.forEach(expense => {
            const date = new Date(expense.date);
            let key;

            if (type === 'daily') {
                key = date.toLocaleDateString();
            } else if (type === 'weekly') {
                const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + 1 - date.getDay()) / 7)}`;
                key = week;
            } else {
                const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                key = month;
            }

            const category = expense.category;
            const amount = parseFloat(expense.amount);

            if (!summary[key]) {
                summary[key] = {};
            }
            if (!summary[key][category]) {
                summary[key][category] = 0;
            }
            summary[key][category] += amount;
        });

        return summary;
    };

    const handleShowSummary = () => {
        const newSummary = getSummary(summaryType, selectedCategory);
        setSummary(newSummary);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const indexOfLastExpense = currentPage * itemsPerPage;
    const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
    const currentExpenses = expenses.slice(indexOfFirstExpense, indexOfLastExpense);

    // Function to calculate total expenses
    const calculateTotal = () => {
        return expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
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
                    <button type="submit">{newExpense.id ? 'Update Expense' : 'Add Expense'}</button>
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
                            {currentExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5">No expenses added yet.</td>
                                </tr>
                            ) : (
                                currentExpenses.map(expense => (
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
                        <tfoot>
                            <tr>
                                <td colSpan="4" style={{textAlign:"center"}}><strong>Total:</strong> {parseFloat(calculateTotal())}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* General div for summary controls */}
                <div className='general-div'>
                    {/* Summary Category Filter */}
                    <div className='filter-category'>
                        <h2>Filter by Category</h2>
                        <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory}>
                            <option value="All Categories">All Categories</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    {/* Summary Controls and Display */}
                    <div className='summery-type'>
                        <h2>Summary Type</h2>
                        <select onChange={(e) => setSummaryType(e.target.value)} value={summaryType}>
                            <option value="monthly">Monthly Summary</option>
                            <option value="weekly">Weekly Summary</option>
                            <option value="daily">Daily Summary</option>
                        </select>
                        <button onClick={handleShowSummary}>
                            Show {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
                        </button>
                    </div>
                </div>

                <div className='summary-display'>
                    <h2>{summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary for {selectedCategory}</h2>
                    <table className="summary-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(summary).length === 0 ? (
                                <tr>
                                    <td colSpan="3">No summary data available yet.</td>
                                </tr>
                            ) : (
                                Object.keys(summary).map(dateKey => (
                                    Object.keys(summary[dateKey]).map(category => (
                                        <tr key={`${dateKey}-${category}`}>
                                            <td>{dateKey}</td>
                                            <td>{category}</td>
                                            <td>{parseFloat(summary[dateKey][category]).toFixed(2)}</td>
                                        </tr>
                                    ))
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Chart Section */}
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
