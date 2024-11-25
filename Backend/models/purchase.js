const mongoose = require('mongoose');
const Product = require('../models/product');
const User = require('../models/userModel');

const PurchaseSchema = new mongoose.Schema(
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
    QuantityPurchased: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    UnitPurchaseAmount: {
      type: Number,
      required: true,
    },
    TotalPurchaseAmount: Number,
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'glass', 'frame'],
      required: true,
    },
  },
  { timestamps: true }
);

PurchaseSchema.pre('save', async function (next) {
  // Generate the total purchase amount
  this.TotalPurchaseAmount = this.UnitPurchaseAmount * this.QuantityPurchased;
  next();
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
module.exports = Purchase;
