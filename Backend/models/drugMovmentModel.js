const mongoose = require('mongoose');
const Product = require('./product');
const Pharmacy = require('./pharmacyModel');
const User = require('./userModel');

const drugMovementSchema = new mongoose.Schema(
  {
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity_moved: { type: Number, required: true, min: 0 },
    date_moved: { type: Date, default: Date.now },
    moved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const DrugMovement = mongoose.model('DrugMovement', drugMovementSchema);
module.exports = DrugMovement;
