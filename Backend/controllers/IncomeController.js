const Income = require('../models/incomeModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

const getAll = require('./handleFactory');
const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Helper function to get data by year (generic for any model)
const getDataByYear = asyncHandler(async (req, res, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  if (!year) {
    throw new AppError('Year is required', 400);
  }

  const { startDate, endDate } = getDateRangeForYear(year);

  if (!startDate || !endDate) {
    throw new AppError('Invalid year', 400);
  }

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$totalNetIncome' },
  };

  const data = await getAggregatedData(Model, matchCriteria, groupBy);
  if (!data) {
    throw new AppError('No data found', 404);
  }

  const totalAmountsByMonth = populateDataArray(data, 12, 'month');
  res.status(200).json({ data: totalAmountsByMonth });
});

// Helper function to get data by month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  if (!year || !month) {
    throw new AppError('Year and month are required', 400);
  }

  const { startDate, endDate } = getDateRangeForMonth(year, month);

  if (!startDate || !endDate) {
    throw new AppError('Invalid year or month', 400);
  }

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: '$totalNetIncome' },
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const data = await getAggregatedData(Model, matchCriteria, groupBy);
  if (!data) {
    throw new AppError('No data found', 404);
  }

  const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');
  res.status(200).json({ data: totalAmountsByDay });
});

// Get sum of all income for a specific category
const getIncomeCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug';

  const totalIncome = await Income.aggregate([
    { $match: { category: category } },
    { $group: { _id: null, total: { $sum: '$totalNetIncome' } } },
  ]);

  if (!totalIncome || totalIncome.length === 0) {
    throw new AppError('No income data found for the specified category', 404);
  }

  const total = totalIncome[0].total;

  res.status(200).json({
    category,
    totalIncome: total,
  });
});

// Create new income record
const createIncome = asyncHandler(async (req, res) => {
  const { totalNetIncome, category, description, date } = req.body;

  if (!totalNetIncome || !category || !description || !date) {
    throw new AppError('All fields are required', 400);
  }

  const newIncome = new Income({
    date,
    description,
    totalNetIncome,
    category,
    userID: req.user._id,
  });

  const savedIncome = await newIncome.save();
  if (!savedIncome) {
    throw new AppError('Failed to create income record', 500);
  }

  res.status(201).json(savedIncome);
});

// Filter income by year and return monthly totals
const filterIncomeByYear = async (req, res) => getDataByYear(req, res, Income);

const filterIncomeByYearAndMonth = async (req, res) =>
  getDataByMonth(req, res, Income);

// Update an income record by ID
const updateIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (!id) {
    throw new AppError('Income ID is required', 400);
  }

  if (Object.keys(updatedData).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  const updatedIncome = await Income.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  if (!updatedIncome) {
    throw new AppError('Income record not found', 404);
  }

  res.json(updatedIncome);
});
// Get all income records
const getAllIncome = getAll(Income, false, {
  path: 'userID',
  select: 'firstName lastName',
});

// Delete an income record by ID
const deleteIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Income ID is required', 400);
  }

  const deletedIncome = await Income.findByIdAndDelete(id);
  if (!deletedIncome) {
    throw new AppError('Income record not found', 404);
  }
  res.json({ message: 'Income record deleted successfully' });
});

module.exports = {
  createIncome,
  updateIncome,
  getAllIncome,
  deleteIncome,
  filterIncomeByYear,
  filterIncomeByYearAndMonth,
  getIncomeCategoryTotal,
};
