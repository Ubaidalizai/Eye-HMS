const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now, // Defaults to current date/time if not provided
      required: true,
    },
    category: {
      type: String,
      enum: ['food', 'salary', 'furniture', 'other'], // Define allowed categories here
      required: true, // Set to true if category is mandatory, otherwise false
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
