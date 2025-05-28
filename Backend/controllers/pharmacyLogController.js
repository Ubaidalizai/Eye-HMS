const PharmacyLog = require('../models/pharmacyLogModel');
const getAll = require('./handleFactory');

const asyncHandler = require('../middlewares/asyncHandler');
const appError = require('../utils/appError');
const PharmacySaleTotal = require('../models/PharmacySalesTotal');
const validateMongoDBId = require('../utils/validateMongoDbId');

// CREATE
exports.createPharmacyLog = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    throw new appError('Amount is required', 400);
  }

  // Fetch the pharmacy sale total
  const saleTotal = await PharmacySaleTotal.findOne();
  if (!saleTotal) {
    throw new appError('Pharmacy sale total not found', 404);
  }

  // Check if the amount to be deducted is valid
  if (saleTotal.totalSalesAmount < amount) {
    throw new appError('Insufficient pharmacy sale total', 400);
  }

  // Deduct the amount
  saleTotal.totalSalesAmount -= amount;
  await saleTotal.save();

  // Create the log
  const log = await PharmacyLog.create({
    amount,
    transferredBy: req.user._id,
  });

  res
    .status(201)
    .json({ message: 'Log created and amount deducted', data: log });
});

// READ ALL
exports.getAllPharmacyLogs = getAll(PharmacyLog, false, {
  path: 'transferredBy',
  select: 'firstName lastName',
});

// READ SINGLE
exports.getPharmacyLogById = asyncHandler(async (req, res) => {
  const log = await PharmacyLog.findById(req.params.id).populate(
    'transferredBy',
    'firstName email'
  );
  if (!log) {
    throw new appError('Log not found', 404);
  }
  res.status(200).json(log);
});

// UPDATE
exports.updatePharmacyLog = asyncHandler(async (req, res) => {
  // Validate MongoDB ID
  validateMongoDBId(req.params.id);

  const log = await PharmacyLog.findById(req.params.id);
  if (!log) {
    throw new appError('Log not found', 404);
  }

  // Ensure a new amount is provided
  if (req.body.amount == null) {
    throw new appError('New amount is required', 400);
  }

  // Calculate the difference between old and new amounts
  const oldAmount = log.amount;
  const newAmount = req.body.amount;
  const diff = oldAmount - newAmount;

  // Update the log with new amount
  log.amount = newAmount;
  await log.save();

  // Update the pharmacy sale total accordingly:
  // If the new amount is lower, we add back the difference.
  // If it's higher, we deduct the extra amount.
  const saleTotal = await PharmacySaleTotal.findById('singleton');
  if (!saleTotal) {
    throw new appError('Pharmacy sale total not found', 404);
  }
  saleTotal.totalSalesAmount += diff;
  await saleTotal.save();

  res.status(200).json({
    message: 'Log updated and pharmacy sale total adjusted',
    data: log,
  });
});

// DELETE
exports.deletePharmacyLog = asyncHandler(async (req, res) => {
  const log = await PharmacyLog.findById(req.params.id);
  if (!log) {
    throw new appError('Log not found', 404);
  }

  // On deletion, add the log amount back to the pharmacy sale total
  const saleTotal = await PharmacySaleTotal.findById('singleton');
  if (!saleTotal) {
    throw new appError('Pharmacy sale total not found', 404);
  }
  saleTotal.totalSalesAmount += log.amount;
  await saleTotal.save();

  await log.deleteOne();
  res.status(200).json({
    message: 'Log deleted and pharmacy sale total adjusted',
  });
});
