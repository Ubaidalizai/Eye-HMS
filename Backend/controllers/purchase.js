const Purchase = require('../models/purchase');
const Product = require('../models/product');
const purchaseStock = require('./purchaseStock');
// const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
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

// Filter purchases by year and return monthly totals
const filterPurchasesByMonth = async (req, res) =>
  getDataByMonth(req, res, Purchase);

const filterPurchasesByYear = async (req, res) =>
  getDataByYear(req, res, Purchase);

// Add Purchase Details
const addPurchase = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);
  const { productID, QuantityPurchased, date, unitPurchaseAmount, category } =
    req.body;

  // Validate required fields
  if (
    !productID ||
    !QuantityPurchased ||
    !purchaseDate ||
    !unitPurchaseAmount ||
    !category
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
      PurchaseDate: purchaseDate,
      UnitPurchaseAmount: unitPurchaseAmount,
      category,
    });

    // Update product stock after purchase
    await purchaseStock(productID, QuantityPurchased);

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

const updatePurchase = asyncHandler(async (req, res) => {
  const _id = req.params.id;
  console.log(req.body);
  // Validate MongoDB ID
  if (!_id || !validateMongoDBId(_id)) {
    res.status(400);
    throw new Error('Invalid purchase ID');
  }

  // Extract only the fields you want to update
  const { QuantityPurchased, UnitPurchaseAmount } = req.body;
  // console.log(typeof QuantityPurchased, UnitPurchaseAmount);

  if (
    QuantityPurchased !== undefined &&
    (!Number.isInteger(QuantityPurchased) || QuantityPurchased < 0)
  ) {
    res.status(400);
    throw new Error('Quantity must be a positive integer');
  }

  if (
    UnitPurchaseAmount !== undefined &&
    (typeof UnitPurchaseAmount !== 'number' || UnitPurchaseAmount <= 0)
  ) {
    res.status(400);
    throw new Error('Unit purchase amount must be a positive number');
  }

  try {
    // Fetch the original purchase to compare changes
    const originalPurchase = await Purchase.findById(_id);
    if (!originalPurchase) {
      res.status(404);
      throw new Error('Purchase not found');
    }

    // Capture the original quantity before updating
    const originalQuantity = originalPurchase.QuantityPurchased;

    // Update fields only if provided
    if (QuantityPurchased !== undefined) {
      originalPurchase.QuantityPurchased = QuantityPurchased;
    }
    if (UnitPurchaseAmount !== undefined) {
      originalPurchase.UnitPurchaseAmount = UnitPurchaseAmount;
    }

    // Recalculate the TotalPurchaseAmount
    originalPurchase.TotalPurchaseAmount =
      originalPurchase.QuantityPurchased * originalPurchase.UnitPurchaseAmount;

    // Save the updated purchase first before updating stock
    const updatedPurchase = await originalPurchase.save();

    // If the quantity changed, update the product stock
    if (
      QuantityPurchased !== undefined &&
      QuantityPurchased !== originalQuantity
    ) {
      const stockDifference = QuantityPurchased - originalQuantity;
      console.log('Stock Difference: ', originalPurchase.ProductID);
      const updatedProduct = await Product.findByIdAndUpdate(
        originalPurchase.ProductID, // Keep the product the same
        { $inc: { stock: stockDifference } }, // Update stock based on the quantity difference
        { new: true, runValidators: true }
      );

      if (!updatedProduct) {
        throw new Error('Failed to update product stock');
      }

      if (updatedProduct.stock < 0) {
        throw new Error('Insufficient stock quantity');
      }
    }

    res.status(200).json({
      success: true,
      message: 'Purchase updated successfully',
      data: updatedPurchase,
    });
  } catch (error) {
    console.error('Update Purchase Error:', error);
    res.status(error.status || 500);
    throw new Error(error.message || 'Error while updating purchase');
  }
});

// Helper function to validate MongoDB ID
const validateMongoDBId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const deletePurchase = asyncHandler(async (req, res) => {
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
    const updatedProduct = await Product.findByIdAndUpdate(
      purchase.ProductID,
      {
        $inc: { stock: -purchase.QuantityPurchased }, // Decrease stock by the quantity of the deleted purchase
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      throw new Error('Failed to update product stock');
    }

    // Prevent negative stock
    if (updatedProduct.stock < 0) {
      throw new Error('Insufficient stock quantity');
    }

    // Delete the purchase
    await purchase.deleteOne();

    res.status(200).json({
      message: 'Purchase deleted successfully',
      deletedPurchase: purchase,
      updatedProductStock: updatedProduct.stock, // Send back the updated stock quantity for the product
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
  updatePurchase,
  deletePurchase,
};
