const mongoose = require('mongoose');
const Pharmacy = require('../models/pharmacyModel');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDBId');
const checkExpiry = require('../utils/checkExpiry');

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

// Get summary of drug sales
exports.getDrugsSummary = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const matchStage = category ? { category: category } : {}; // No filtering if no category provided

  const total = await Pharmacy.aggregate([
    { $match: matchStage },
    {
      $project: {
        totalValue: { $multiply: ['$salePrice', '$quantity'] },
      },
    },
    {
      $group: {
        _id: null,
        totalDrugSalesValue: { $sum: '$totalValue' },
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
exports.deleteDrug = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDBId(id);

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Check if the drug exists in the pharmacy
    const drug = await Pharmacy.findById(id).session(session);
    if (!drug) {
      throw new AppError('Drug not found', 404);
    }

    // Step 2: Check if the product exists in the inventory
    const product = await Product.findOne({ name: drug.name }).session(session);
    if (!product) {
      throw new AppError('Product not found in inventory', 404);
    }

    // Step 3: Update stock in the inventory
    product.stock += drug.quantity;
    await product.save({ session });

    // Step 4: Delete the drug from the pharmacy
    const drugDeleted = await Pharmacy.findByIdAndDelete(id, { session });
    if (!drugDeleted) {
      throw new AppError('Failed to delete drug', 500);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(new AppError('Failed to delete drug and update stock', 500));
  }
});

// Check for drugs expiring within 90 days
exports.checkDrugExpiry = checkExpiry(Pharmacy, 'expiryDate');
