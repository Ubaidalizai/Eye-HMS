const Purchase = require('../models/purchase');
const Product = require('../models/product');
const Glass = require('../models/glassesModel');
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

// Get sum of all Purchases for a specific category (e.g., 'drug')
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
    expiryDate,
    category,
  } = req.body;

  // Validate required fields
  if (
    !productID ||
    !QuantityPurchased ||
    !date ||
    !unitPurchaseAmount ||
    !category
  ) {
    throw new AppError('All fields are required.', 400);
  }

  if (QuantityPurchased <= 0 || unitPurchaseAmount < 0) {
    throw new AppError('Invalid purchase data values.', 400);
  }

  validateMongoDBId(productID);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find product/glass based on category
    let item;
    if (category === 'drug') {
      item = await Product.findById(productID).session(session);
    } else {
      item = await Glass.findById(productID).session(session);
    }

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Step 2: Update quantity/stock and price
    if (category === 'drug') {
      item.stock += Number(QuantityPurchased);
      if (expiryDate) {
        item.expiryDate = expiryDate;
      }
    } else {
      item.quantity += Number(QuantityPurchased);
    }

    item.purchasePrice = Number(unitPurchaseAmount);

    await item.save({ session });

    // Step 3: Create purchase
    const TotalPurchaseAmount = unitPurchaseAmount * QuantityPurchased;

    const purchaseDetails = await Purchase.create(
      [
        {
          userID,
          ProductID: productID,
          productModel: category === 'drug' ? 'Product' : 'Glass',
          QuantityPurchased,
          originalQuantity: QuantityPurchased,
          date,
          UnitPurchaseAmount: unitPurchaseAmount,
          category,
          TotalPurchaseAmount,
          expiryDate: category === 'drug' ? expiryDate : undefined,
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

  const { QuantityPurchased, UnitPurchaseAmount, date, expiryDate } = req.body;

  if (
    QuantityPurchased === undefined ||
    UnitPurchaseAmount === undefined ||
    !date
  ) {
    throw new AppError('All fields are required for update.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the existing purchase
    const existingPurchase = await Purchase.findById(id).session(session);
    if (!existingPurchase) {
      throw new AppError('Purchase not found', 404);
    }

    const { ProductID, category } = existingPurchase;

    // 2. Get item from correct model
    let item;
    if (category === 'drug') {
      item = await Product.findById(ProductID).session(session);
    } else {
      item = await Glass.findById(ProductID).session(session);
    }

    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // 3. Calculate the difference
    const delta = QuantityPurchased - existingPurchase.QuantityPurchased;

    // 4. Validate and update quantity/stock
    if (category === 'drug') {
      if (item.stock + delta < 0) {
        throw new AppError(
          `Insufficient stock. Current stock is ${
            item.stock
          }, cannot reduce by ${-delta}.`,
          400
        );
      }
      item.stock += delta;
      if (expiryDate) {
        item.expiryDate = expiryDate;
      }
    } else {
      console.log(item.quantity, delta);
      if (item.quantity + delta < 0) {
        throw new AppError(
          `Insufficient quantity. Current quantity is ${
            item.quantity
          }, cannot reduce by ${-delta}.`,
          400
        );
      }
      item.quantity += delta;
    }

    item.purchasePrice = UnitPurchaseAmount;
    await item.save({ session });

    // 5. Update the purchase
    existingPurchase.QuantityPurchased = QuantityPurchased;
    existingPurchase.originalQuantity = QuantityPurchased;
    existingPurchase.UnitPurchaseAmount = UnitPurchaseAmount;
    existingPurchase.date = date;
    if (category === 'drug') {
      existingPurchase.expiryDate = expiryDate;
    }
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
    // Step 1: Fetch purchase document
    const purchase = await Purchase.findById(id).session(session);
    if (!purchase) {
      throw new AppError('Purchase not found.', 404);
    }

    const { ProductID, originalQuantity, productModel } = purchase;

    // Step 2: Get correct model instance (Product or Glass)
    const Model = mongoose.model(productModel);
    const product = await Model.findById(ProductID).session(session);

    if (product) {
      // Step 3: Restore stock
      if (productModel === 'Product') {
        product.stock += originalQuantity;
      } else if (productModel === 'Glass') {
        product.quantity += originalQuantity;
      }

      if (product.stock < 0 || product.quantity < 0) {
        throw new AppError('Insufficient stock quantity after restore.', 400);
      }

      await product.save({ session });
    }

    // Step 4: Delete purchase
    await Purchase.deleteOne({ _id: id }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Purchase deleted and stock restored successfully.',
      data: {
        deletedPurchase: purchase,
        updatedStock: product?.stock ?? product?.quantity ?? null,
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
