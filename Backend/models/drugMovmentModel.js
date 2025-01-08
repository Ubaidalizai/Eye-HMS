const mongoose = require('mongoose');
const Pharmacy = require('./pharmacyModel');
const User = require('./userModel');

const drugMovementSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    quantity_moved: { type: Number, required: true, min: 0 },
    date_moved: { type: Date, default: Date.now },
    moved_by: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'glass', 'frame'],
      required: true,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Make expiryDate required only for drugs
          return this.category === 'drug' ? !!value : true;
        },
        message: 'Expiry date is required for drugs.',
      },
    },
  },
  { timestamps: true }
);

const DrugMovement = mongoose.model('DrugMovement', drugMovementSchema);
module.exports = DrugMovement;
