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
exports.deleteDrug = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  // Step 1: Check if the drug exists in the pharmacy
  const drug = await Pharmacy.findById(id);
  if (!drug) {
    return next(new AppError('Drug not found', 404));
  }

  // Step 2: Check if the product exists in the inventory
  const product = await Product.findOne({ name: drug.name });
  if (!product) {
    return next(new AppError('Product not found in inventory', 404));
  }

  // Step 3: Perform manual transaction-like operations
  try {
    // Update stock in the product
    product.stock += drug.quantity;

    // Delete the drug
    const drugDeleted = await drug.deleteOne();
    if (!drugDeleted) {
      throw new Error('Failed to delete drug');
    }

    // Save the updated product
    const productUpdated = await product.save();
    if (!productUpdated) {
      throw new Error('Failed to update product stock');
    }

    // If both operations succeed, send the success response
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    // Manual rollback mechanism
    console.error('Error during manual transaction:', error);

    // Rollback: Revert product stock if drug deletion succeeded but product update failed
    const rollbackProduct = await Product.findOne({ name: drug.name });
    if (rollbackProduct) {
      rollbackProduct.stock -= drug.quantity;
      await rollbackProduct.save();
      console.log('Rollback successful: Product stock reverted');
    }

    return next(new AppError('Failed to delete drug and update stock', 500));
  }
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
