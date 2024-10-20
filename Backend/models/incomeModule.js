const mongoose = require('mongoose');

// Define the Income schema
const incomeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalIncome: {
      type: Number,
      required: [true, 'An income must have a total income'],
    },
    totalNetIncome: {
      type: Number,
      required: [true, 'An income must have a total net income'],
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true, // Description of income
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
