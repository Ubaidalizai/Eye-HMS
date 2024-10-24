const Income = require('../models/incomeModule');
const getAll = require('./handleFactory');

// Create new income record
const createIncome = async (req, res) => {
  try {
    const { totalIncome, totalNetIncome, category, reason, date } = req.body;
    const newIncome = new Income({
      date,
      totalIncome,
      totalNetIncome,
      category,
      reason,
      userID: req.user._id,
    });

    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to calculate start and end dates for a month
const getDateRangeForMonth = (year, month) => {
  const startDate = new Date(year, month - 1, 1); // Start of the month (month is 0-indexed in JavaScript)
  const endDate = new Date(year, month, 0); // End of the month (last day of the month)
  return { startDate, endDate };
};

// Filter income by year and return monthly totals
const filterIncomeByYear = async (req, res) => {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({ error: 'Year is required.' });
    }

    const startDate = new Date(`${year}-01-01T00:00:00.000+00:00`);
    const endDate = new Date(`${Number(year) + 1}-01-01T00:00:00.000+00:00`);

    const incomes = await Income.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Initialize arrays with 12 zeros (one for each month)
    let totalIncome = Array(12).fill(0);
    let totalNetIncome = Array(12).fill(0);

    // Calculate total income and total net income for each month
    incomes.forEach((income) => {
      const month = new Date(income.date).getMonth(); // Get month index (0 = Jan, 11 = Dec)
      totalIncome[month] += income.totalIncome; // Add totalIncome to the respective month
      totalNetIncome[month] += income.totalNetIncome; // Add totalNetIncome to the respective month
    });

    res.status(200).json({
      data: { totalIncome, totalNetIncome },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const filterIncomeByYearAndMonth = async (req, res) => {
  const { year, month } = req.params; // Get the year and month from the request parameters
  const { category } = req.query; // Get the category from the query parameters (optional)

  try {
    const { startDate, endDate } = getDateRangeForMonth(year, month);

    // Build the match object with optional category filtering
    const matchCriteria = {
      date: {
        $gte: startDate, // Greater than or equal to the start of the month
        $lte: endDate, // Less than or equal to the end of the month
      },
    };

    if (category) {
      matchCriteria.category = category; // Add category filter if provided
    }

    // Aggregate totalIncome and totalNetIncome for each day of the month
    const incomes = await Income.aggregate([
      {
        $match: matchCriteria, // Use the built match object
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' } }, // Group by the day of the income date
          totalIncome: { $sum: '$totalIncome' }, // Sum totalIncome for each day
          totalNetIncome: { $sum: '$totalNetIncome' }, // Sum totalNetIncome for each day
        },
      },
      {
        $sort: { '_id.day': 1 }, // Sort the results by day
      },
    ]);

    // Create arrays with elements for each day of the month, initializing with 0s
    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
    const totalIncome = new Array(daysInMonth).fill(0);
    const totalNetIncome = new Array(daysInMonth).fill(0);

    // Populate the correct day in the arrays
    incomes.forEach((income) => {
      totalIncome[income._id.day - 1] = income.totalIncome; // Assign totalIncome to the correct day
      totalNetIncome[income._id.day - 1] = income.totalNetIncome; // Assign totalNetIncome to the correct day
    });

    res.status(200).json({
      data: { totalIncome, totalNetIncome },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

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
};
