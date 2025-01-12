const mongoose = require('mongoose');

const bedroomSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    rent: { type: Number, required: true, min: 0 },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, required: true, default: 0, min: 0, max: 100 },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

const Bedroom = mongoose.model('Bedroom', bedroomSchema);

module.exports = Bedroom;
