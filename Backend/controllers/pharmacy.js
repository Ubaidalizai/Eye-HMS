const Pharmacy = require('../models/pharmacyModel');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

exports.getDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const drug = await Pharmacy.findById(id);
  if (!drug) {
    return res.status(404).json({
      status: 'fail',
      message: 'Drug not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { drug },
  });
});

exports.updateDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const drug = await Pharmacy.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!drug) {
    return res.status(404).json({
      status: 'fail',
      message: 'Drug not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: { drug },
  });
});

exports.deleteDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const drug = await Pharmacy.findByIdAndDelete(id);

  if (!drug) {
    return res.status(404).json({
      status: 'fail',
      message: 'Drug not found',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.checkDrugExpiry = asyncHandler(async (req, res) => {
  const beforeThirtyDays = new Date();
  beforeThirtyDays.setDate(beforeThirtyDays.getDate() + 30);

  const expireDrugs = await Pharmacy.find({
    expiryDate: { $lte: beforeThirtyDays },
    quantity: { $gt: 0 },
  });

  if (expireDrugs.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No expired products found',
    });
  }

  res.status(200).json({
    status: 'success',
    length: expireDrugs.length,
    data: { expireDrugs },
  });
});
