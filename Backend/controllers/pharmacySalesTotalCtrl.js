const mongoose = require('mongoose');
const PharmacySalesTotal = require('../models/PharmacySalesTotal');
const PharmacyLog = require('../models/pharmacyLogModel');
const asyncHandler = require('../middlewares/asyncHandler');
const appError = require('../utils/appError');

exports.moveSalesTotalLog = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new appError('Invalid amount provided', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Retrieve the singleton sales total document
    const salesTotal = await PharmacySalesTotal.findById('singleton').session(
      session
    );
    if (!salesTotal) {
      throw new appError('Sales total document not found', 404);
    }
    if (salesTotal.totalSalesAmount < amount) {
      throw new appError(
        'Insufficient total sales amount for the requested transfer',
        400
      );
    }

    // Create a pharmacy log entry
    await PharmacyLog.create(
      [
        {
          amount,
          transferredBy: req.user ? req.user._id : null,
        },
      ],
      { session }
    );

    // Deduct the transferred amount from totalSalesAmount
    salesTotal.totalSalesAmount -= amount;
    await salesTotal.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Sales transferred to log successfully',
      remainingSales: salesTotal.totalSalesAmount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    const errorMessage = error.message || 'Failed to transfer sales total';
    throw new appError(errorMessage, error.statusCode || 500);
  }
});

exports.getPharmacySalesTotal = asyncHandler(async (req, res) => {
  const salesTotal = await PharmacySalesTotal.findById('singleton');

  res.status(200).json({ totalSalesAmount: salesTotal?.totalSalesAmount || 0 });
});
