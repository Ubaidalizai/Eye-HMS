// models/Prescription.js

const mongoose = require('mongoose');
const Patient = require('../models/patientModel');
const PrescriptionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true },
  doctor: { type: String, required: true },

  // Patient ID reference
  patient_ID: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you are linking to a Patient model
    ref: 'Patient', // If you have a Patient model, otherwise, just leave it as ObjectId
    required: true,
  },

  // Nested structure for right eye
  rightEye: {
    sphere: { type: Number, required: true },
    cylinder: { type: Number, required: true },
    axis: { type: Number, required: true },
  },

  // Nested structure for left eye
  leftEye: {
    sphere: { type: Number, required: true },
    cylinder: { type: Number, required: true },
    axis: { type: Number, required: true },
  },

  pdDistance: { type: Number, required: true },
  pdNear: { type: Number, required: true },
  pdPower: { type: Number, required: true },
  lensType: {
    type: String,
    required: true,
    enum: ['Bifocal', 'Progressive', 'Single Vision'], // Restrict to valid types
  },
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);
module.exports = Prescription;
