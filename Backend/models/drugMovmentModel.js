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
    pharmacy_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
    },
    quantity_moved: { type: Number, required: true },
    date_moved: { type: Date, default: Date.now },
    moved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['drug', 'glasses', 'glass', 'frame'],
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
