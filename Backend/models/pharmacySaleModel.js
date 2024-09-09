// saleModel.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  soldItems: [
    {
      drugId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Drug',
        required: true,
      },
      name: String,
      quantity: Number,
      price: Number,
      income: Number,
    },
  ],
  totalIncome: {
    type: Number,
    required: [true, 'A sale must have a total income'],
  },
  totalNetIncome: {
    type: Number,
    required: [true, 'A sale must have a total net income'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const pharmacySale = mongoose.model('pharmacySale', saleSchema);

module.exports = pharmacySale;
