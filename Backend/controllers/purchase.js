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

  const { startDate, endDate } = getDateRangeForYear(year);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$QuantityPurchased' },
  };

  try {
    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    console.log(data);
    const totalAmountsByMonth = populateDataArray(data, 12, 'month');
    res.status(200).json({ data: totalAmountsByMonth });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForMonth(year, month);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: '$QuantityPurchased' },
  };

  try {
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');
    res.status(200).json({ data: totalAmountsByDay });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get sum of all Sales for a specific category (e.g., 'drug')
const getPurchesCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug'; // Get category from query params, default to 'drug'

  try {
    // Sum all income for the provided category
    const totalPurches = await Purchase.aggregate([
      { $match: { category: category } }, // Match the exact category
      { $group: { _id: null, total: { $sum: '$QuantityPurchased' } } },
    ]);

    // Check for total income and format the response
    const total = totalPurches.length > 0 ? totalPurches[0].total : 0;

    res.status(200).json({
      category,
      totalPurches: total, // Set the field to totalSales as requested
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error calculating total Purches',
      error: error.message,
    });
  }
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
    category,
    expiryDate,
  } = req.body;

  // Validate required fields
  if (
    !productID ||
    !QuantityPurchased ||
    !date ||
    !unitPurchaseAmount ||
    !category ||
    !expiryDate
  ) {
    res.status(400);
    throw new Error('All fields are required.');
  }

  try {
    // Create a new Purchase entry
    const purchaseDetails = await Purchase.create({
      userID,
      ProductID: productID,
      QuantityPurchased: QuantityPurchased,
      date: date,
      UnitPurchaseAmount: unitPurchaseAmount,
      category,
    });

    // Update product stock after purchase
    await purchaseStock(productID, QuantityPurchased, expiryDate);

    // Send success response
    res.status(200).json({
      message: 'Purchase added successfully',
      data: { purchaseDetails },
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Error while adding purchase');
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
  validateMongoDBId(userID); // Check if _id is valid

  try {
    // Use aggregation to calculate the total purchase amount
    const result = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalPurchaseAmount: { $sum: '$TotalPurchaseAmount' },
        },
      },
    ]);

    const totalPurchaseAmount =
      result.length > 0 ? result[0].totalPurchaseAmount : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalPurchaseAmount,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error('Error calculating total purchase amount');
  }
});

// Helper function to validate MongoDB ID
const validateMongoDBId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const deletePurchase = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  // Validate MongoDB ID
  if (!validateMongoDBId(id)) {
    res.status(400);
    throw new Error('Invalid purchase ID');
  }

  try {
    // Find the purchase to get the quantity and product info before deleting
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      res.status(404);
      throw new Error('Purchase not found');
    }

    // Update the product stock before deleting the purchase
    const product = await Product.findById(purchase.ProductID);
    if (!product) {
      res.status(404);
      throw new Error('Associated product not found');
    }

    const stockDifference = -purchase.QuantityPurchased;
    product.stock += stockDifference; // Adjust stock based on the difference
    // Prevent negative stock
    if (product.stock < 0) {
      return next(new AppError('Insufficient stock quantity', 400));
    }

    await product.save();

    // Delete the purchase
    await purchase.deleteOne();

    res.status(200).json({
      message: 'Purchase deleted successfully',
      deletedPurchase: purchase,
      updatedProductStock: product.stock, // Send back the updated stock quantity for the product
    });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500);
    throw new Error(error.message || 'Error while deleting purchase');
  }
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
