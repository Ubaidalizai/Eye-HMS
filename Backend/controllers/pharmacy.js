const Pharmacy = require('../models/pharmacyModel');

exports.getDrugsInPharmacy = async (req, res) => {
  try {
    const drugs = await Pharmacy.find();
    res.status(200).json(drugs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
