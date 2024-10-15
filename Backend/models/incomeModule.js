const mongoose = require('mongoose');

// Define the Income schema
const incomeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String, // e.g., "Sales", "Consultation", "Insurance Reimbursement"
      required: true,
    },
    description: {
      type: String,
      required: true, // Description of income
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid',
      required: true,
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
