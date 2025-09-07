// saleModel.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    purchaseRefId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Purchase',
    },
    productRefId: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Each sold item must reference a product or glass'],
      refPath: 'productModel',
    },
    productModel: {
      type: String,
      required: true,
      enum: ['Pharmacy', 'Glass'], // Models you are referencing
    },
    quantity: {
      type: Number,
      required: [true, 'A sold item must have a quantity'],
      min: 0,
    },
    income: {
      type: Number,
      required: [true, 'A sold item must have an income'],
      min: 0,
    },
    remainingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'glass', 'frame'],
      required: [true, 'A sale must have a valid category'],
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
