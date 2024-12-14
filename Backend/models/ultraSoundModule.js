// models/Ultrasound.js
const mongoose = require('mongoose');

const ultrasoundSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String },
  percentage: { type: Number, required: true },
});

const Ultrasound = mongoose.model('Ultrasound', ultrasoundSchema);

module.exports = Ultrasound;
