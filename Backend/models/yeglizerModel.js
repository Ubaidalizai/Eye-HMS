const mongoose = require('mongoose');

const yeglizerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientName: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  appointmentDate: { type: String, required: true },
  eyePower: { type: String, required: true },
  prescription: { type: String, required: true },
  percentage: { type: Number, default: 0 }, // Added percentage field
});

module.exports = mongoose.model('Yeglizer', yeglizerSchema);
