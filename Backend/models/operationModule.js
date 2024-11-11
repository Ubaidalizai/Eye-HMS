const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  doctor: { type: String, required: true },
});

const Operation = mongoose.model('Operation', operationSchema);

module.exports = Operation;
