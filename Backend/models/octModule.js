// models/OCT.js
const mongoose = require('mongoose');

const octSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OperationType',
      required: true,
    },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const OCT = mongoose.model('OCT', octSchema);

module.exports = OCT;
