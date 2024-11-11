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
    },
    salePrice: {
      type: Number,
      required: [true, 'Pharmacy product must have a sale price'],
    },
    category: {
      type: String,
      enum: ['drug', 'glasses', 'glass', 'frame'],
      required: [
        true,
        'Pharmacy product must have a category (either drug, sunglasses or frame)',
      ],
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

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;
