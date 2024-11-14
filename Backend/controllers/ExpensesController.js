// controllers/expenseController.js
const Expense = require('../models/ExpensesModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError'); // Custom error handler
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
const getDataByYear = asyncHandler(async (req, res, next, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForYear(year);
  const matchCriteria = { date: { $gte: startDate, $lte: endDate } };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$amount' },
  };

  const data = await getAggregatedData(Model, matchCriteria, groupBy);
  if (!data)
    return next(new AppError('No data found for the specified year', 404));

  const totalAmountsByMonth = populateDataArray(data, 12, 'month');
  res.status(200).json({ data: totalAmountsByMonth });
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, next, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForMonth(year, month);
  const matchCriteria = { date: { $gte: startDate, $lte: endDate } };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: '$amount' },
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const data = await getAggregatedData(Model, matchCriteria, groupBy);
  if (!data)
    return next(new AppError('No data found for the specified month', 404));

  const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');
  res.status(200).json({ data: totalAmountsByDay });
});

// Example usage for expenses
const getExpensesByYear = (req, res, next) =>
  getDataByYear(req, res, next, Expense);
const getExpensesByMonth = (req, res, next) =>
  getDataByMonth(req, res, next, Expense);

// Get all expenses
const getExpenses = getAll(Expense);

// Add a new expense
// Add a new expense
const addExpense = asyncHandler(async (req, res, next) => {
  const { amount, date, reason, category } = req.body;

  // Validate required fields
  if (!amount || !date || !reason || !category) {
    return next(
      new AppError(
        'All fields (amount, date, reason, category) are required',
        400
      )
    );
  }

  const newExpense = new Expense({ amount, date, reason, category });

  const savedExpense = await newExpense.save();
  res.status(201).json({ status: 'success', data: { savedExpense } });
});

// Get total sum of expenses for a specific category
const getCategoryTotal = asyncHandler(async (req, res, next) => {
  const category = req.query.category || 'other'; // Default to 'other' if category not provided

  const totalExpense = await Expense.aggregate([
    { $match: { category } }, // Filter by specified category
    { $group: { _id: null, total: { $sum: '$amount' } } }, // Sum up the amount
  ]);

  const total = totalExpense.length > 0 ? totalExpense[0].total : 0;
  res
    .status(200)
    .json({ status: 'success', data: { category, totalExpense: total } });
});

// Update an expense by ID
const updateExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { amount, date, reason, category } = req.body;

  // Find and update the expense
  const updatedExpense = await Expense.findByIdAndUpdate(
    id,
    { amount, date, reason, category },
    { new: true, runValidators: true }
  );

  // Check if the expense was found
  if (!updatedExpense) {
    return next(new AppError('Expense not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updatedExpense },
  });
});

// Delete an expense by ID
const deleteExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find and delete the expense
  const deletedExpense = await Expense.findByIdAndDelete(id);

  // Check if the expense was found
  if (!deletedExpense) {
    return next(new AppError('Expense not found', 404));
  }

  res.status(204).json({
    status: 'success',
    message: 'Expense deleted successfully',
  });
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
