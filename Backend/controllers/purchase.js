const Purchase = require('../models/purchase');
const Product = require('../models/product');
const purchaseStock = require('./purchaseStock');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError'); // Custom error handler
const getAll = require('./handleFactory');
const mongoose = require('mongoose');

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
    totalAmount: { $sum: '$QuantityPurchased' }, // Sum up the QuantityPurchased field
  };

  // Fetch aggregated data
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  if (!data.length) {
    throw new AppError('No data found for the specified year.', 404);
  }

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

  if (!data.length) {
    throw new AppError('No data found for the specified month.', 404);
  }

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
    category,
    expiryDate,
  } = req.body;

  // Validate required fields
  if (
    !productID ||
    !QuantityPurchased ||
    !date ||
    !unitPurchaseAmount ||
    !salePrice ||
    !category ||
    !expiryDate
  ) {
    throw new AppError('All fields are required.', 400);
  }

  // Validate MongoDB product ID
  validateMongoDBId(productID);

  try {
    // Step 1: Create a new Purchase entry
    const purchaseDetails = await Purchase.create({
      userID,
      ProductID: productID,
      QuantityPurchased,
      salePrice,
      date,
      UnitPurchaseAmount: unitPurchaseAmount,
      category,
    });

    // Step 2: Update product stock after purchase
    const product = await Product.findById(productID);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    product.stock += Number(QuantityPurchased);
    product.purchasePrice = Number(unitPurchaseAmount);
    product.salePrice = Number(salePrice);
    product.expiryDate = expiryDate;
    await product.save();

    // Step 3: Send success response
    res.status(200).json({
      status: 'success',
      message: 'Purchase added successfully.',
      data: { purchaseDetails },
    });
  } catch (error) {
    console.error('Error adding purchase:', error);

    // If `Purchase.create` was successful but stock update failed, manually rollback
    const purchase = await Purchase.findOne({
      userID,
      ProductID: productID,
      QuantityPurchased,
      date,
    });

    if (purchase) {
      await purchase.deleteOne(); // Rollback the purchase record
    }

    throw error; // Re-throw the error to trigger the error handler
  }
});

// Get All Purchase Data with Product Name And Also By Category
const getPurchaseData = getAll(Purchase, true, {
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

// Helper function to validate MongoDB ID
const validateMongoDBId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const deletePurchase = asyncHandler(async (req, res) => {
  const id = req.params.id;

  // Validate MongoDB ID
  if (!validateMongoDBId(id)) {
    return next(new AppError('Invalid purchase ID.', 400));
  }

  // Find the purchase to get the quantity and product info before deleting
  const purchase = await Purchase.findById(id);
  if (!purchase) {
    throw new AppError('Purchase not found.', 404);
  }

  // Update the product stock before deleting the purchase
  const product = await Product.findById(purchase.ProductID);
  if (!product) {
    throw new AppError('Associated product not found.', 404);
  }

  // Adjust stock based on the purchase quantity
  const stockDifference = -purchase.QuantityPurchased;
  product.stock += stockDifference;

  // Prevent negative stock
  if (product.stock < 0) {
    throw new AppError('Insufficient stock quantity.', 400);
  }

  // Save updated stock
  await product.save();

  // Delete the purchase record
  await purchase.deleteOne();

  // Send success response
  res.status(200).json({
    status: 'success',
    message: 'Purchase deleted successfully.',
    data: {
      deletedPurchase: purchase,
      updatedProductStock: product.stock,
    },
  });
});

module.exports = {
  filterPurchasesByYear,
  filterPurchasesByMonth,
  addPurchase,
  getPurchaseData,
  getTotalPurchaseAmount,
  deletePurchase,
  getPurchesCategoryTotal,
};
