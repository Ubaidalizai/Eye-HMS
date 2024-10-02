import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './newManagement.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Sample predefined categories
const categories = [
    'Operational Costs',
    'Staff Salaries',
    'Medical Supplies',
    'Marketing',
];

const ExpenseManagement = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ amount: '', date: '', reason: '', category: '', id: null });
    const [summaryType, setSummaryType] = useState('monthly'); // State for summary type
    const [summary, setSummary] = useState({}); // State for summary data

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
    };

    const editExpense = (expense) => {
        setNewExpense(expense);
    };

    const deleteExpense = (id) => {
        setExpenses(expenses.filter(expense => expense.id !== id));
    };

    const getSummary = (type) => {
        const summary = {};
        expenses.forEach(expense => {
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
        const newSummary = getSummary(summaryType);
        setSummary(newSummary);
    };

    return (
        <div className='parent'>
            <div className="expense-management">
                <h1>Expense Management</h1>

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

                <h2>Expense by Category</h2>
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

            <div className='expense-list-detail'>
                <h2>Expense List</h2>
                <ul className="expense-list">
                    {expenses.length === 0 ? (
                        <li>No expenses added yet.</li>
                    ) : (
                        expenses.map(expense => (
                            <li key={expense.id} className="expense-item">
                                <span>{expense.amount} - {new Date(expense.date).toLocaleDateString()} - {expense.reason} ({expense.category})</span>
                                <button onClick={() => editExpense(expense)} className="edit-button">Edit</button>
                                <button onClick={() => deleteExpense(expense.id)} className="delete-button">Delete</button>
                            </li>
                        ))
                    )}
                </ul>

                <h2>Summary Type</h2>
                <select onChange={(e) => setSummaryType(e.target.value)} value={summaryType}>
                    <option value="monthly">Monthly Summary</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="daily">Daily Summary</option>
                </select>
                <button onClick={handleShowSummary}>
                    Show {summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary
                </button>

                {/* Summary Display Section */}
                <div className='summary-display'>
                    <h2>{summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} Summary</h2>
                    <pre className="summary">{JSON.stringify(summary, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default ExpenseManagement;
