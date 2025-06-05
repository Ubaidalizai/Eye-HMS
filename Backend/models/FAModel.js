const mongoose = require('mongoose');

const FASchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    time: { type: String, required: true },
    date: { type: Date, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    FAType: {
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

const FA = mongoose.model('FA', FASchema);

module.exports = FA;
