const Pharmacy = require('../models/pharmacyModel');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');

const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

// GET SINGLE DRUG
exports.getDrug = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findById(id);
    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }
    res.status(200).json({
      status: 'success',
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to retrieve the drug');
  }
});

exports.updateDrug = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findByIdAndUpdate(id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the update operation against the schema
    });

    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        drug,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to update the drug');
  }
});

// pharmacyController.js
exports.deleteDrug = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDBId(id);
    const drug = await Pharmacy.findByIdAndDelete(id);

    if (!drug) {
      res.status(404);
      throw new Error('Drug not found');
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to delete the drug');
  }
};
