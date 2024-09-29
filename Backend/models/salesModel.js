// saleModel.js
const mongoose = require('mongoose');
const Pharmacy = require('./pharmacyModel');
const User = require('./userModel');

const saleSchema = new mongoose.Schema({
  soldItems: [
    {
      drugId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pharmacy',
        required: true,
      },
      quantity: {
        type: Number,
        required: [true, 'A sale must have a total income'],
      },
      income: Number,
    },
  ],
  totalIncome: {
    type: Number,
    required: [true, 'A sale must have a total income'],
  },
  totalNetIncome: {
    type: Number,
    required: [true, 'A sale must have a total net income'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    enum: ['drug', 'sunglasses'],
    required: [true, 'A sale must defend on a specific category'],
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
