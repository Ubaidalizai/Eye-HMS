// routes/expenseRoutes.js
const express = require('express');
const {
  getExpenses,
  getExpensesByYear,
  getExpensesByMonth,
  addExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/ExpensesController');

const router = express.Router();

// GET all expenses
router.route('/').get(getExpenses).post(addExpense);
// GET expenses by year (e.g., /api/expenses/year/2024)
router.get('/:year', getExpensesByYear);
// GET expenses by month (e.g., /api/expenses/month/2024/10 for October 2024)
router.get('/:year/:month', getExpensesByMonth);

router;
router.route('/:id').patch(updateExpense).delete(deleteExpense);

module.exports = router;
