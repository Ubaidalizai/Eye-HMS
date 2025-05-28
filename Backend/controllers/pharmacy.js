const mongoose = require('mongoose');
const Pharmacy = require('../models/pharmacyModel');
const Product = require('../models/product');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDbId');
const checkExpiry = require('../utils/checkExpiry');

exports.getAllDrugsInPharmacy = getAll(Pharmacy);

// Get summary of drug sales
exports.getDrugsSummary = asyncHandler(async (req, res) => {
  const result = await Pharmacy.aggregate([
    { $match: {} },
    {
      $project: {
        totalValue: { $multiply: ['$salePrice', '$quantity'] },
        isLowQuantity: { $cond: [{ $lte: ['$quantity', '$minLevel'] }, 1, 0] },
        quantity: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalDrugSalesValue: { $sum: '$totalValue' },
        totalCount: { $sum: 1 },
        lowQuantityCount: { $sum: '$isLowQuantity' },
        totalQuantity: { $sum: '$quantity' },
      },
    },
  ]);

  const totalSalePrice = result[0]?.totalDrugSalesValue || 0;
  const totalCount = result[0]?.totalCount || 0;
  const lowQuantityCount = result[0]?.lowQuantityCount || 0;
  const totalQuantity = result[0]?.totalQuantity || 0;

  res.status(200).json({
    totalSalePrice,
    length: totalCount,
    lowQuantityCount,
    totalQuantity,
  });
});

// Get details of a specific drug
exports.getDrug = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDBId(id);

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
  validateMongoDBId(id);

  const drug = await Pharmacy.findByIdAndUpdate(
    id,
    {
      minLevel: req.body.minLevel,
      expireNotifyDuration: req.body.expireNotifyDuration,
    },
    {
      new: true,
      runValidators: true,
    }
  );

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
    if (product) {
      product.stock += drug.quantity;
      await product.save({ session });
    }

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

    const errorMessage =
      error.message || 'Failed to delete drug and update stock';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

// Check for drugs expiring within 90 days
exports.checkDrugExpiry = checkExpiry(Pharmacy, 'expiryDate');

// Get low stock pharmacy items
exports.getLowStockDrugs = asyncHandler(async (req, res) => {
  // Find pharmacy items where quantity is less than or equal to minLevel
  const lowStockDrugs = await Pharmacy.find({
    $expr: { $lte: ['$quantity', '$minLevel'] },
    quantity: { $gt: 0 }, // Only include items that have some stock (not zero)
  }).sort({ name: 1 });

  res.status(200).json({
    status: 'success',
    length: lowStockDrugs.length,
    data: { lowStockDrugs },
  });
});
