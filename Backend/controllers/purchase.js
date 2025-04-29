const Purchase = require('../models/purchase');
const Product = require('../models/product');
const purchaseStock = require('./purchaseStock');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError'); // Custom error handler
const getAll = require('./handleFactory');
const mongoose = require('mongoose');
const validateMongoDBId = require('../utils/validateMongoDBId');

const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Get summarized data by month for a given year (generic for any model)
const getDataByYear = asyncHandler(async (req, res, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  // Validate year parameter
  if (!year || isNaN(year)) {
    throw new AppError(
      'Invalid year provided. Year must be a valid number.',
      400
    );
  }

  // Get the date range for the specified year
  const { startDate, endDate } = getDateRangeForYear(year);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } }, // Group data by month
    totalAmount: { $sum: '$TotalPurchaseAmount' }, // Sum up the QuantityPurchased field
  };

  // Fetch aggregated data
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  // Populate missing months
  const totalAmountsByMonth = populateDataArray(data, 12, 'month');

  // Send response
  res.status(200).json({
    status: 'success',
    data: totalAmountsByMonth,
  });
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  // Validate year and month parameters
  if (
    !year ||
    isNaN(year) ||
    !month ||
    isNaN(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new AppError(
      'Invalid year or month provided. Ensure valid numbers are used.',
      400
    );
  }

  // Get the date range for the specified month
  const { startDate, endDate } = getDateRangeForMonth(year, month);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } }, // Group data by day
    totalAmount: { $sum: '$QuantityPurchased' }, // Sum up the QuantityPurchased field
  };

  // Fetch aggregated data
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  // Populate missing days for the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');

  // Send response
  res.status(200).json({
    status: 'success',
    data: totalAmountsByDay,
  });
});

// Get sum of all Sales for a specific category (e.g., 'drug')
const getPurchesCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug'; // Default to 'drug'

  // Aggregate total purchases for the specified category
  const totalPurches = await Purchase.aggregate([
    { $match: { category } }, // Match the exact category
    { $group: { _id: null, total: { $sum: '$QuantityPurchased' } } }, // Sum the QuantityPurchased
  ]);

  // Check if there are any results
  const total = totalPurches.length > 0 ? totalPurches[0].total : 0;

  // Send response
  res.status(200).json({
    status: 'success',
    data: {
      category,
      totalPurches: total,
    },
  });
});

// Filter purchases by year and return monthly totals
const filterPurchasesByMonth = async (req, res) =>
  getDataByMonth(req, res, Purchase);

const filterPurchasesByYear = async (req, res) =>
  getDataByYear(req, res, Purchase);

// Add Purchase Details
const addPurchase = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);

  const {
    productID,
    QuantityPurchased,
    date,
    unitPurchaseAmount,
    salePrice,
    expiryDate,
  } = req.body;

  // Validate required fields
  if (
    !productID ||
    !QuantityPurchased ||
    !date ||
    !unitPurchaseAmount ||
    !salePrice ||
    !expiryDate
  ) {
    throw new AppError('All fields are required.', 400);
  }

  if (QuantityPurchased <= 0 || unitPurchaseAmount < 0 || salePrice < 0) {
    throw new AppError('Invalid purchase data values.', 400);
  }

  validateMongoDBId(productID);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Check and update the product
    const product = await Product.findById(productID).session(session);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Update product values
    product.stock += Number(QuantityPurchased);
    product.purchasePrice = Number(unitPurchaseAmount);
    product.salePrice = Number(salePrice);
    product.expiryDate = expiryDate;

    await product.save({ session });

    // Step 2: Create purchase with calculated total
    const TotalPurchaseAmount = unitPurchaseAmount * QuantityPurchased;

    const purchaseDetails = await Purchase.create(
      [
        {
          userID,
          ProductID: productID,
          QuantityPurchased,
          originalQuantity: QuantityPurchased,
          salePrice,
          date,
          UnitPurchaseAmount: unitPurchaseAmount,
          category: product.category,
          TotalPurchaseAmount,
          expiryDate,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Purchase added successfully.',
      data: { purchaseDetails },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to add purchase.';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

// Get All Purchase Data with Product Name And Also By Category
const getPurchaseData = getAll(Purchase, false, {
  path: 'ProductID',
  select: 'name',
});

// Get total purchase amount
const getTotalPurchaseAmount = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;

  // Validate MongoDB ID
  validateMongoDBId(userID);

  // Use aggregation to calculate the total purchase amount
  const result = await Purchase.aggregate([
    {
      $group: {
        _id: null,
        totalPurchaseAmount: { $sum: '$TotalPurchaseAmount' }, // Aggregate total purchase amount
      },
    },
  ]);

  const totalPurchaseAmount =
    result.length > 0 ? result[0].totalPurchaseAmount : 0;

  // Send success response
  res.status(200).json({
    status: 'success',
    data: {
      totalPurchaseAmount,
    },
  });
});

const editPurchase = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const { QuantityPurchased, UnitPurchaseAmount, salePrice, date, expiryDate } =
    req.body;
  if (
    QuantityPurchased === undefined ||
    UnitPurchaseAmount === undefined ||
    salePrice === undefined ||
    !date ||
    !expiryDate
  ) {
    throw new AppError('All fields are required for update.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the purchase to be edited
    const existingPurchase = await Purchase.findById(id).session(session);
    if (!existingPurchase) {
      throw new AppError('Purchase not found', 404);
    }

    const product = await Product.findById(existingPurchase.ProductID).session(
      session
    );
    if (!product) throw new AppError('Product not found', 404);

    // Calculate net change
    const delta = QuantityPurchased - existingPurchase.QuantityPurchased;

    // Prevent negative stock
    if (product.stock + delta < 0) {
      throw new AppError(
        `Insufficient stock. Current stock is ${
          product.stock
        }, cannot reduce by ${-delta}.`,
        400
      );
    }

    // Apply only the difference
    product.stock += delta;
    product.purchasePrice = UnitPurchaseAmount;
    product.salePrice = salePrice;
    product.expiryDate = expiryDate;
    await product.save({ session });

    // Update purchase
    existingPurchase.QuantityPurchased = QuantityPurchased;
    existingPurchase.originalQuantity = QuantityPurchased;
    existingPurchase.UnitPurchaseAmount = UnitPurchaseAmount;
    existingPurchase.salePrice = salePrice;
    existingPurchase.date = date;
    existingPurchase.expiryDate = expiryDate;
    existingPurchase.TotalPurchaseAmount =
      QuantityPurchased * UnitPurchaseAmount;
    await existingPurchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Purchase updated successfully.',
      data: existingPurchase,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    const errorMessage = err.message || 'Failed to update purchase.';
    throw new AppError(errorMessage, err.statusCode || 500);
  }
});

const deletePurchase = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  validateMongoDBId(id);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) {
      throw new AppError('Purchase not found.', 404);
    }

    const product = await Product.findById(purchase.ProductID).session(session);

    if (product) {
      const stockDifference = -purchase.QuantityPurchased;
      product.stock += stockDifference;

      if (product.stock < 0) {
        throw new AppError('Insufficient stock quantity.', 400);
      }

      await product.save({ session });
    }
    // If no product, continue to delete purchase anyway

    await Purchase.deleteOne({ _id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Purchase deleted successfully.',
      data: {
        deletedPurchase: purchase,
        updatedProductStock: product ? product.stock : null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to delete purchase.';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

module.exports = {
  deletePurchase,
};

module.exports = {
  filterPurchasesByYear,
  filterPurchasesByMonth,
  addPurchase,
  getPurchaseData,
  getTotalPurchaseAmount,
  editPurchase,
  deletePurchase,
  getPurchesCategoryTotal,
};
