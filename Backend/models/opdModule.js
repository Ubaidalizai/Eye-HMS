const mongoose = require('mongoose');

const opdSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  totalAmount: { type: Number, required: true, min: 0 },
});

const OPD = mongoose.model('OPD', opdSchema);

module.exports = OPD;
