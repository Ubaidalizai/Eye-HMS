const mongoose = require('mongoose');

const yeglizerSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  totalAmount: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model('Yeglizer', yeglizerSchema);
