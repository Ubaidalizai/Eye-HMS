const mongoose = require('mongoose');

const glassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    minLevel: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['sunglasses', 'glass', 'frame'],
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Glass = mongoose.model('Glass', glassSchema);
module.exports = Glass;
