// controllers/expenseController.js
const Expense = require('../models/ExpensesModule');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');
const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Get summarized data by month for a given year (generic for any model)
const getDataByYear = asyncHandler(async (req, res, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForYear(year);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$amount' },
  };

  try {
    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    const totalAmountsByMonth = populateDataArray(data, 12, 'month');
    res.status(200).json({ data: totalAmountsByMonth });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForMonth(year, month);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: '$amount' },
  };

  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');
    res.status(200).json({ data: totalAmountsByDay });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Example usage for expenses
const getExpensesByYear = (req, res) => getDataByYear(req, res, Expense);
const getExpensesByMonth = (req, res) => getDataByMonth(req, res, Expense);

// Get all expenses
const getExpenses = getAll(Expense);

// Add a new expense
const addExpense = asyncHandler(async (req, res) => {
  const { amount, date, reason, category } = req.body;

  try {
    const newExpense = new Expense({ amount, date, reason, category });
    const savedExpense = await newExpense.save();
    res.status(201).json({ data: { savedExpense } });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error saving expense', error: error.message });
  }
});

// Get sum of all expenses for a specific category (e.g., 'food')
const getCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'other'; // Get category from query params, default to 'other'

  try {
    // Sum all expenses for the provided category
    const totalExpense = await Expense.aggregate([
      { $match: { category: category } }, // Ensure exact category match
      { $group: { _id: null, total: { $sum: '$amount' } } }, // Sum the 'amount' field
    ]);

    const total = totalExpense.length > 0 ? totalExpense[0].total : 0;
    res.status(200).json({ category, totalExpense: total });
  } catch (error) {
    res.status(500).json({
      message: 'Error calculating total expense',
      error: error.message,
    });
  }
});

// Update an expense by ID
const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, date, reason, category } = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { amount, date, reason, category },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error updating expense', error: error.message });
  }
});

// Delete an expense by ID
const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(204).json({ message: 'Expense deleted' });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error deleting expense', error: error.message });
  }
});

module.exports = {
  getExpenses,
  getExpensesByYear,
  getExpensesByMonth,
  addExpense,
  updateExpense,
  deleteExpense,
  getCategoryTotal,
};
