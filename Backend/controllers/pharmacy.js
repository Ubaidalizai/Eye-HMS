const Pharmacy = require('../models/pharmacyModel');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDBId');

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

// Get summary of drug sales
exports.getDrugsSummary = asyncHandler(async (req, res) => {
  const total = await Pharmacy.aggregate([
    {
      $match: { category: 'drug' }, // Filter for only the drug category
    },
    {
      $project: {
        totalValue: { $multiply: ['$salePrice', '$quantity'] }, // Calculate total value (salePrice * quantity)
      },
    },
    {
      $group: {
        _id: null, // No specific group, calculate a single total
        totalDrugSalesValue: { $sum: '$totalValue' }, // Sum up the total values
      },
    },
  ]);
  const totalSalePrice = total.length > 0 ? total[0].totalDrugSalesValue : 0;

  res.status(200).json({
    totalSalePrice,
  });
});

// Get details of a specific drug
exports.getDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!validateMongoDBId(id)) {
    throw new AppError('Invalid Drug ID', 400);
  }

  const drug = await Pharmacy.findById(id);

  if (!drug) {
    throw new AppError('Drug not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { drug },
  });
});

// Update a specific drug
exports.updateDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!validateMongoDBId(id)) {
    throw new AppError('Invalid Drug ID', 400);
  }

  const drug = await Pharmacy.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!drug) {
    throw new AppError('Drug not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { drug },
  });
});

// Delete a specific drug
exports.deleteDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!validateMongoDBId(id)) {
    throw new AppError('Invalid Drug ID', 400);
  }

  const drug = await Pharmacy.findByIdAndDelete(id);

  if (!drug) {
    throw new AppError('Drug not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Check for drugs expiring within 30 days
exports.checkDrugExpiry = asyncHandler(async (req, res) => {
  const beforeThirtyDays = new Date();
  beforeThirtyDays.setDate(beforeThirtyDays.getDate() + 30);

  const expireDrugs = await Pharmacy.find({
    expiryDate: { $lte: beforeThirtyDays },
    quantity: { $gt: 0 },
  });

  if (expireDrugs.length === 0) {
    return res.status(200).json({ message: 'No expired drugs found' });
  }

  res.status(200).json({
    status: 'success',
    length: expireDrugs.length,
    data: { expireDrugs },
  });
});
