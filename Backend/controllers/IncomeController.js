const Income = require('../models/incomeModule');
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
    totalAmount: { $sum: '$totalNetIncome' },
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
    totalAmount: { $sum: '$totalNetIncome' },
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

// Get sum of all income for a specific category (e.g., 'drug')
const getIncomeCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug'; // Get category from query params, default to 'drug'

  try {
    // Sum all income for the provided category
    const totalIncome = await Income.aggregate([
      { $match: { category: category } }, // Match the exact category
      { $group: { _id: null, total: { $sum: '$totalNetIncome' } } }, // Sum the 'totalNetIncome' field
    ]);

    // Check for total income and format the response
    const total = totalIncome.length > 0 ? totalIncome[0].total : 0;

    res.status(200).json({
      category,
      totalIncome: total, // Set the field to totalIncome as requested
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error calculating total Income',
      error: error.message,
    });
  }
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
