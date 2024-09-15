const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/product');

const SaleSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    StoreID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'store',
      required: true,
    },
    StockSold: {
      type: Number,
      required: true,
    },
    SaleDate: {
      type: Date,
      required: true,
    },
    TotalSaleAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Sales = mongoose.model('sales', SaleSchema);
module.exports = Sales;
