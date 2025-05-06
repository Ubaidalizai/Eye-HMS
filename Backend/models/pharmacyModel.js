const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pharmacy product must have a name'],
    },
    manufacturer: {
      type: String,
      required: [true, 'Pharmacy product must have a manufacturer'],
    },
    quantity: {
      type: Number,
      required: [true, 'Pharmacy product must have a quantity'],
      min: 0,
    },
    minLevel: {
      type: Number,
      required: [true, 'Pharmacy product must have a minimum level'],
      min: 0,
    },
    expireNotifyDuration: {
      type: Number,
      required: [true, 'Pharmacy product must have an expiry notify duration'],
      min: 0,
    },
    salePrice: {
      type: Number,
      required: [true, 'Pharmacy product must have a sale price'],
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Pharmacy product must have an expiry date'],
    },
  },
  { timestamps: true }
);

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;
