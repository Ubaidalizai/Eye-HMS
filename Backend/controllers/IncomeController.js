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
const getDataByYear = (Model) =>
  asyncHandler(async (req, res) => {
    const { year } = req.params;
    const { category } = req.query;

    const { startDate, endDate } = getDateRangeForYear(year);

    const matchCriteria = {
      date: { $gte: startDate, $lte: endDate },
    };
    if (category) matchCriteria.category = category;

    const groupBy = {
      _id: { month: { $month: '$date' } },
      totalAmount: { $sum: '$totalNetIncome' },
    };

    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    const totalAmountsByMonth = populateDataArray(data, 12, 'month');
    res.status(200).json({ data: totalAmountsByMonth });
  });

// Helper function to get data by month (generic for any model)
const getDataByMonth = (Model) =>
  asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    const { category } = req.query;

    const { startDate, endDate } = getDateRangeForMonth(year, month);

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

  const total = totalIncome.length > 0 ? totalIncome[0].total : 0;

  res.status(200).json({
    category,
    totalIncome: total,
  });
});

// Create new income record
const createIncome = async (req, res) => {
  try {
    const { totalNetIncome, category, description, date } = req.body;
    const newIncome = new Income({
      date,
      description,
      totalNetIncome,
      category,
      userID: req.user._id,
    });

    await newIncome.save();
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Filter income by year and return monthly totals
const filterIncomeByYear = async (req, res) => getDataByYear(req, res, Income);

const filterIncomeByYearAndMonth = async (req, res) =>
  getDataByMonth(req, res, Income);

// Update an income record by ID
const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const updatedIncome = await Income.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedIncome) {
      return res.status(404).json({ message: 'Income record not found' });
    }

    res.json(updatedIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all income records
const getAllIncome = getAll(Income, false, {
  path: 'userID',
  select: 'firstName lastName',
});

// Delete an income record by ID
const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedIncome = await Income.findByIdAndDelete(id);
    if (!deletedIncome) {
      return res.status(404).json({ message: 'Income record not found' });
    }
    res.json({ message: 'Income record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  createIncome,
  updateIncome,
  getAllIncome,
  deleteIncome,
  filterIncomeByYear,
  filterIncomeByYearAndMonth,
  getIncomeCategoryTotal,
};
