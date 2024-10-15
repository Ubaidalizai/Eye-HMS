// controllers/expenseController.js
const Expense = require('../models/ExpensesModule');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');

// Helper function to calculate start and end dates for the year
const getDateRangeForYear = (year) => {
  const startDate = new Date(`${year}-01-01T00:00:00Z`); // Start of the year
  const endDate = new Date(`${year}-12-31T23:59:59Z`); // End of the year
  return { startDate, endDate };
};

// Get expenses summarized by month for a given year (return as an array)
const getExpensesByYear = asyncHandler(async (req, res) => {
  const { year } = req.params; // Get the year from the request parameters

  try {
    const { startDate, endDate } = getDateRangeForYear(year);

    // Aggregate expenses to sum amounts for each month
    const expenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: startDate, // Greater than or equal to start of the year
            $lte: endDate, // Less than or equal to end of the year
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } }, // Group by the month of the expense date
          totalAmount: { $sum: '$amount' }, // Sum the amount for each month
        },
      },
      {
        $sort: { '_id.month': 1 }, // Sort the results by month (January to December)
      },
    ]);

    // Create an array with 12 elements for each month's expenses, initializing with 0s
    const totalAmountsByMonth = new Array(12).fill(0);

    // Populate the correct month in the array
    expenses.forEach((expense) => {
      totalAmountsByMonth[expense._id.month - 1] = expense.totalAmount; // Assign totalAmount to the correct month
    });

    res.status(200).json(totalAmountsByMonth);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Helper function to calculate start and end dates for a month
const getDateRangeForMonth = (year, month) => {
  const startDate = new Date(year, month - 1, 1); // Start of the month (month is 0-indexed in JavaScript)
  const endDate = new Date(year, month, 0); // End of the month (last day of the month)
  return { startDate, endDate };
};

// Get expenses summarized by day for a given month
const getExpensesByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params; // Get the year and month from the request parameters

  try {
    const { startDate, endDate } = getDateRangeForMonth(year, month);

    // Aggregate expenses to sum amounts for each day of the month
    const expenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: startDate, // Greater than or equal to start of the month
            $lte: endDate, // Less than or equal to end of the month
          },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' } }, // Group by the day of the expense date
          totalAmount: { $sum: '$amount' }, // Sum the amount for each day
        },
      },
      {
        $sort: { '_id.day': 1 }, // Sort the results by day
      },
    ]);

    // Create an array with elements for each day of the month, initializing with 0s
    const daysInMonth = new Date(year, month, 0).getDate(); // Get the number of days in the month
    const totalAmountsByDay = new Array(daysInMonth).fill(0);

    // Populate the correct day in the array
    expenses.forEach((expense) => {
      totalAmountsByDay[expense._id.day - 1] = expense.totalAmount; // Assign totalAmount to the correct day
    });

    res.status(200).json(totalAmountsByDay);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get all expenses
const getExpenses = getAll(Expense);

// Add a new expense
const addExpense = asyncHandler(async (req, res) => {
  const { amount, date, reason, category } = req.body;

  try {
    const newExpense = new Expense({ amount, date, reason, category });
    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error saving expense', error: error.message });
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
};
