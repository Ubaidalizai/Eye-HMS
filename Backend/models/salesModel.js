// saleModel.js
const mongoose = require('mongoose');
const Pharmacy = require('./pharmacyModel');
const Product = require('./pharmacyModel');
const User = require('./userModel');

const saleSchema = new mongoose.Schema({
  soldDetails: [
    {
      productRefId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Each sold item must reference a product or drug'],
        refPath: 'category', // Dynamic reference based on category ('Pharmacy' or 'Product')
      },
      quantity: {
        type: Number,
        required: [true, 'A sold item must have a quantity'],
      },
      income: {
        type: Number,
        required: [true, 'A sold item must have an income'],
      },
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
    enum: ['Pharmacy', 'Product'], // Pharmacy for drugs, Product for sunglasses or other products
    required: [true, 'A sale must have a category (either drug or product)'],
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
