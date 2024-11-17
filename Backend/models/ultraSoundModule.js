// models/Ultrasound.js
const mongoose = require('mongoose');

const ultrasoundSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String }, // Store the image path or URL
});

const Ultrasound = mongoose.model('Ultrasound', ultrasoundSchema);

module.exports = Ultrasound;
