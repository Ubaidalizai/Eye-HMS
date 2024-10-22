const Income = require('../models/incomeModule');
const getAll = require('./handleFactory');

// Create new income record
const createIncome = async (req, res) => {
  try {
    const { totalIncome, totalNetIncome, category, reason, date } = req.body;
    console.log(req.body);
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

// Filter income by year and return monthly totals
const filterIncomeByYear = async (req, res) => {
  try {
    const { year } = req.query;

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

    // Initialize an array with 12 zeros (one for each month)
    const monthlyIncome = Array(12).fill(0);

    // Calculate total income for each month
    incomes.forEach((income) => {
      const month = new Date(income.date).getMonth(); // Get month index (0 = Jan, 11 = Dec)
      monthlyIncome[month] += income.amount; // Add income amount to the respective month
    });

    res.status(200).json(monthlyIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const filterIncomeByYearAndMonth = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month are required.' });
    }

    // Get the start date and end date for the month
    const startDate = new Date(`${year}-${month}-01T00:00:00.000+00:00`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // Set to the first day of the next month

    // Find all incomes within the given year and month
    const filteredIncomes = await Income.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    // Initialize an array with 31 zeros (for each day of the month)
    const dailyIncome = Array(31).fill(0);

    // Iterate through the incomes and add the amounts to the respective day
    filteredIncomes.forEach((income) => {
      const day = new Date(income.date).getDate(); // Get day of the month (1-31)
      dailyIncome[day - 1] += income.amount; // Add income to the respective day (array index 0 = day 1)
    });

    res.status(200).json(dailyIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
