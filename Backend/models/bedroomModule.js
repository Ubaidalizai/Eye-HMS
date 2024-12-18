const mongoose = require('mongoose');

const bedroomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  rent: { type: Number, required: true },
  percentage: { type: Number, required: true }, // New percentage field
});

const Bedroom = mongoose.model('Bedroom', bedroomSchema);

module.exports = Bedroom;
