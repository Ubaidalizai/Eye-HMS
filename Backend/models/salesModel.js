// saleModel.js
const mongoose = require('mongoose');
const Pharmacy = require('./pharmacyModel');
const Product = require('./pharmacyModel');
const User = require('./userModel');

const saleSchema = new mongoose.Schema(
  {
    productRefId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Each sold item must reference a sunglasses or drug'],
      ref: 'Pharmacy',
    },
    quantity: {
      type: Number,
      required: [true, 'A sold item must have a quantity'],
    },
    income: {
      type: Number,
      required: [true, 'A sold item must have an income'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'sunglasses', 'frame'],
      required: [
        true,
        'A sale must have a category (either drug or sunglasses)',
      ],
    },
    userID: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
