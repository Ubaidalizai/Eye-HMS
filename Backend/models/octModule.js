// models/OCT.js
const mongoose = require('mongoose');

const octSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  eyeExamined: {
    type: String,
    enum: ['Left', 'Right', 'Both'],
    required: true,
  },
  scanType: { type: String, required: true },
  results: { type: String, required: true },
  percentage: { type: Number, required: true }, // Added percentage field
});

const OCT = mongoose.model('OCT', octSchema);

module.exports = OCT;
