const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now, required: true },
    doctor: { type: String, default: '' },
    rightEye: {
      sphere: { type: Number, default: null },
      cylinder: { type: Number, default: null },
      axis: { type: Number, default: null },
    },
    leftEye: {
      sphere: { type: Number, default: null },
      cylinder: { type: Number, default: null },
      axis: { type: Number, default: null },
    },
    pdDistance: { type: Number, default: null },
    pdNear: { type: Number, default: null },
    pdPower: { type: Number, default: null },
    lensType: {
      type: String,
      enum: ['Bifocal', 'Progressive', 'Single Vision'],
    },
  },
  { timestamps: true }
);

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
module.exports = Prescription;
