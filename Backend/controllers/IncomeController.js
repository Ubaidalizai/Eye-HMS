const Income = require('../models/incomeModule');

// Create new income record
const createIncome = async (req, res) => {
  try {
    const { date, amount, category, description, paymentStatus } = req.body;

    const newIncome = new Income({
      date,
      amount,
      category,
      description,
      paymentStatus,
    });

    const savedIncome = await newIncome.save();
    res.status(201).json(savedIncome);
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
const getAllIncome = async (req, res) => {
  try {
    const incomes = await Income.find();
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single income record by I
const getIncomeById = async (req, res) => {
  try {
    const { id } = req.params;
    const income = await Income.findById(id);
    if (!income) {
      return res.status(404).json({ message: 'Income record not found' });
    }
    res.json(income);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
  getIncomeById,
  deleteIncome,
};
