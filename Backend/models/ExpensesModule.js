const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    reasons: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now, // Defaults to current date/time if not provided
      required: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
