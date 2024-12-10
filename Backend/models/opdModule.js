const mongoose = require('mongoose');

const opdSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  diagnosis: { type: String, required: true },
  prescription: { type: String, required: true },
  percentage: { type: Number, required: true },
});

const OPD = mongoose.model('OPD', opdSchema);

module.exports = OPD;
