const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  salePrice: { type: Number, required: true },
});

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
module.exports = Pharmacy;
