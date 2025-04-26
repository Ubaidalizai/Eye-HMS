const mongoose = require('mongoose');

const PharmacyLogSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  transferredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PharmacyLog', PharmacyLogSchema);
