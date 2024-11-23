const mongoose = require('mongoose');
const Sale = require('./salesModel');

// Define the Income schema
const incomeSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalNetIncome: {
      type: Number,
      required: [true, 'An income must have a total net income'],
    },
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'sunglasses', 'frame'],
      required: true,
    },
    description: {
      type: String,
      required: true, // Description of income
    },
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
