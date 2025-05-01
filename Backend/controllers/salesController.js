const mongoose = require('mongoose');
const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const PharmacySalesTotal = require('../models/PharmacySalesTotal');

const validateMongoDBId = require('../utils/validateMongoDBId');
const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Main sellItems function
const sellItems = asyncHandler(async (req, res) => {
  const { soldItems } = req.body;

  if (!Array.isArray(soldItems) || !soldItems.length) {
    throw new AppError('No sold items provided.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receipt = [];
    let totalIncome = 0;

    for (const soldItem of soldItems) {
      const { productRefId, quantity, category, date = new Date() } = soldItem;

      // Step 1: Find the Pharmacy product
      const pharmacyItem = await Pharmacy.findById(productRefId).session(
        session
      );
      if (!pharmacyItem) {
        throw new AppError(
          `Product not found in pharmacy: ${productRefId}`,
          404
        );
      }

      if (pharmacyItem.quantity < quantity) {
        throw new AppError(
          `Insufficient pharmacy stock for ${pharmacyItem.name}`,
          400
        );
      }

      // Find product in inventory for retrieving purchase
      const product = await Product.findOne({
        name: pharmacyItem.name,
      }).session(session);
      if (!product) {
        throw new AppError(
          `Product with name ${pharmacyItem.name} not found in inventory`,
          404
        );
      }

      let remainingQty = quantity;

      // Step 2: Sell across Purchase batches FIFO
      while (remainingQty > 0) {
        const batch = await Purchase.findOne({
          ProductID: product._id,
          QuantityPurchased: { $gt: 0 },
        })
          .sort({ date: 1 })
          .session(session);

        if (!batch) {
          throw new AppError(
            `No available Purchase batch for ${pharmacyItem.name}`,
            400
          );
        }

        const sellQty = Math.min(batch.QuantityPurchased, remainingQty);
        const saleIncome = pharmacyItem.salePrice * sellQty;
        const purchaseCost = batch.UnitPurchaseAmount * sellQty;
        const netIncome = saleIncome - purchaseCost;

        // Step 3: Create Sale record
        const [sale] = await Sale.create(
          [
            {
              purchaseRefId: batch._id,
              productRefId: pharmacyItem._id,
              quantity: sellQty,
              income: saleIncome,
              date,
              category,
              userID: req.user._id,
            },
          ],
          { session }
        );

        // Step 4: Decrease stock from batch and pharmacy
        batch.QuantityPurchased -= sellQty;
        await batch.save({ session });

        pharmacyItem.quantity -= sellQty;
        await pharmacyItem.save({ session });

        // Step 5: Create Income record
        if (netIncome > 0) {
          await Income.create(
            [
              {
                saleId: sale._id,
                saleModel: 'pharmacyModel',
                date,
                totalNetIncome: netIncome,
                category,
                description: `Sale of ${pharmacyItem.name} (${category})`,
                userID: req.user._id,
              },
            ],
            { session }
          );
        }

        // Step 6: Update Sales Ledger (singleton)
        let ledger = await PharmacySalesTotal.findById('singleton').session(
          session
        );
        if (!ledger) {
          ledger = new PharmacySalesTotal({
            _id: 'singleton',
            totalSalesAmount: 0,
          });
        }
        ledger.totalSalesAmount += saleIncome;
        await ledger.save({ session });

        // Step 7: Build receipt line
        const existingLine = receipt.find(
          (line) => line.productName === pharmacyItem.name
        );

        if (existingLine) {
          existingLine.quantity += sellQty;
          existingLine.income += saleIncome;
        } else {
          receipt.push({
            productName: pharmacyItem.name,
            quantity: sellQty,
            income: saleIncome,
            category,
            date,
          });
        }

        totalIncome += saleIncome;
        remainingQty -= sellQty;
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Final receipt
    const generatedReceipt = {
      date: new Date().toISOString(),
      soldItems: receipt,
      totalIncome,
    };

    res.status(201).json({
      status: 'success',
      data: { receipt: generatedReceipt },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      error.message || 'Failed to complete sale',
      error.statusCode || 500
    );
  }
});

const getAllSales = getAll(Sale, false, [
  { path: 'productRefId', select: 'name salePrice' },
  { path: 'userID', select: 'firstName lastName' },
]);

// Get summarized data by month for a given year (generic for any model)
const getDataByYear = asyncHandler(async (req, res, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  // Validate year parameter
  if (!year || isNaN(year)) {
    throw new AppError('Invalid year provided.', 400);
  }

  // Get the date range for the provided year
  const { startDate, endDate } = getDateRangeForYear(year);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } }, // Group by month
    totalAmount: { $sum: '$income' }, // Sum the income
  };

  // Fetch aggregated data
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  // Populate data for each month (ensure all months are included)
  const totalAmountsByDay = populateDataArray(data, 12, 'month');

  // Send response
  res.status(200).json({ data: totalAmountsByDay });
});

// Get sum of all Sales for a specific category (e.g., 'drug')
const getSalesCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug'; // Default to 'drug'

  // Aggregate total sales for the specified category
  const totalSales = await Sale.aggregate([
    { $match: { category } }, // Match the category
    { $group: { _id: null, total: { $sum: '$totalNetIncome' } } }, // Sum the 'totalNetIncome'
  ]);

  // Ensure valid response even if no data is found
  const total = totalSales.length > 0 ? totalSales[0].total : 0;

  res.status(200).json({
    status: 'success',
    data: {
      category,
      totalSales: total,
    },
  });
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  // Validate year and month parameters
  if (!year || isNaN(year) || !month || isNaN(month)) {
    throw new AppError('Invalid year or month provided.', 400);
  }

  // Get the date range for the given month
  const { startDate, endDate } = getDateRangeForMonth(year, month);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } }, // Group by day
    totalAmount: { $sum: '$income' }, // Sum the income
  };

  // Fetch aggregated data
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  // Populate missing days for the month
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');

  res.status(200).json({
    status: 'success',
    data: totalAmountsByDay,
  });
});

// Get monthly sales ( total income and total net income, total sold items )
const getOneMonthSales = asyncHandler(async (req, res) =>
  getDataByMonth(req, res, Sale)
);

const getOneYearSales = asyncHandler(async (req, res) =>
  getDataByYear(req, res, Sale)
);

const getOneMonthSalesWithFullDetails = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  // Validate year and month
  if (
    !year ||
    isNaN(year) ||
    !month ||
    isNaN(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new AppError('Invalid year or month provided.', 400);
  }

  // Get the first and last days of the specified month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Aggregate sales data
  const sales = await Sale.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $lookup: {
        from: 'pharmacies', // Assuming the collection for products is named 'pharmacies'
        localField: 'soldDetails.productRefId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $lookup: {
        from: 'users', // Assuming the collection for users is named 'users'
        localField: 'userID',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $unwind: '$userDetails', // Unwind user details
    },
    {
      $project: {
        soldDetails: 1,
        totalSale: 1,
        totalNetIncome: 1,
        date: 1,
        category: 1,
        user: {
          _id: '$userDetails._id',
          firstName: '$userDetails.firstName',
          lastName: '$userDetails.lastName',
        },
        productDetails: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          salePrice: '$productDetails.salePrice',
        },
      },
    },
    {
      $sort: { date: 1 }, // Sort by date in ascending order
    },
  ]);

  if (!sales.length) {
    throw new AppError('No sales found for the given month.', 404);
  }

  // Send response
  res.status(200).json({
    status: 'success',
    data: sales,
  });
});

const deleteSale = asyncHandler(async (req, res) => {
  const saleId = req.params.id;

  // Validate MongoDB ID
  validateMongoDBId(saleId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the sale record
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new AppError('Sale not found.', 404);
    }

    const { productRefId, purchaseRefId, quantity } = sale;

    // Step 2: Restore pharmacy product quantity
    const product = await Pharmacy.findById(productRefId).session(session);
    if (product) {
      product.quantity += quantity;
      await product.save({ session });
    }

    // Step 3: Restore batch quantity
    const purchaseBatch = await Purchase.findById(purchaseRefId).session(
      session
    );
    if (purchaseBatch) {
      purchaseBatch.QuantityPurchased += quantity;
      await purchaseBatch.save({ session });
    }

    // Step 4: Delete related income record
    await Income.deleteOne({ saleId }).session(session);

    // Step 5: Delete the sale
    await Sale.findByIdAndDelete(saleId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: 'success',
      message: 'Sale deleted and stock restored.',
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      error.message || 'Failed to delete sale.',
      error.statusCode || 500
    );
  }
});

module.exports = {
  sellItems,
  getAllSales,
  getOneYearSales,
  getOneMonthSales,
  getOneMonthSalesWithFullDetails,
  deleteSale,
  getSalesCategoryTotal,
};
