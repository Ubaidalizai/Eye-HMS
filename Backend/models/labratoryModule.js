// models/Laboratory.js
const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  testType: { type: String, required: true },
  sampleCollected: { type: String, required: true },
  results: { type: String },
  remarks: { type: String },
  percentage: { type: Number, required: true }, // Percentage field as an object
});

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

module.exports = Laboratory;
