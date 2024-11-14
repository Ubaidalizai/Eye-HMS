const mongoose = require('mongoose');

const bedroomSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  rent: { type: Number, required: true },
});

const Bedroom = mongoose.model('Bedroom', bedroomSchema);

module.exports = Bedroom;
