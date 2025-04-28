const mongoose = require('mongoose');

const pharmacySalesTotalSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'singleton',
  },
  totalSalesAmount: {
    type: Number,
    required: true,
    default: 0, // sum of all sales made
  },
});

module.exports = mongoose.model('PharmacySalesTotal', pharmacySalesTotalSchema);
