// models/Laboratory.js
const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OperationType',
      required: true,
    },
    percentage: { type: Number, required: true, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

module.exports = Laboratory;
