const Sales = require('../models/sales');
const soldStock = require('../controllers/soldStock');
const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');
const mongoose = require('mongoose');

// Add Sales
const addSales = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);

  const { productID, stockSold, saleDate, totalSaleAmount } = req.body;

  // Validate required fields
  if (!productID || !storeID || !stockSold || !saleDate || !totalSaleAmount) {
    res.status(400);
    throw new Error('All fields are required.');
  }
  try {
    const sale = Sales.create({
      userID,
      ProductID: productID,
      StockSold: stockSold,
      SaleDate: saleDate,
      TotalSaleAmount: totalSaleAmount,
    });

    await soldStock(productID, stockSold);

    res.status(200).json({
      status: 'success',
      data: {
        sale,
      },
    });
  } catch (error) {
    res.status(402);
    throw new Error('Product sale not completed!');
  }
});

// Get All Sales Data
const getSalesData = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);
  try {
    const findAllSalesData = await Sales.find({ userID })
      .sort({ _id: -1 }) // -1 for descending order
      .populate('ProductID');

    if (!findAllSalesData) {
      res.status(404);
      throw new Error('Not any sales done yet!');
    }

    res.status(200).json({
      status: 'success',
      data: {
        findAllSalesData,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('some thing went wrong');
  }
});

// Get total sales amount
const getTotalSalesAmount = asyncHandler(async (req, res) => {
  const { _id: userID } = req.user;
  validateMongoDBId(userID);

  try {
    const result = await Sales.aggregate([
      { $match: { userID: mongoose.Types.ObjectId(userID) } },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: '$TotalSaleAmount' },
        },
      },
    ]);
    const totalSaleAmount = result.length > 0 ? result[0].totalSaleAmount : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalSaleAmount,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Some thing went wrong');
  }
});

// Get monthly sales data by using MongoDB's aggregation framework
const getMonthlySales = asyncHandler(async (req, res) => {
  try {
    // Aggregate monthly sales amount by using MongoDB's aggregation framework
    const salesByMonth = await Sales.aggregate([
      {
        $group: {
          _id: { $month: '$SaleDate' }, // Extract month from the SaleDate field
          totalAmount: { $sum: '$TotalSaleAmount' }, // Sum up the TotalSaleAmount for each month
        },
      },
    ]);
    // Initialize an array with 12 zeros for each month
    const salesAmount = Array(12).fill(0);

    // Populate the salesAmount array with the results from the aggregation
    salesByMonth.forEach((sale) => {
      const monthIndex = sale._id - 1; // Month index (0 for January, 11 for December)
      salesAmount[monthIndex] = sale.totalAmount;
    });

    res.status(200).json({
      status: 'success',
      data: {
        salesAmount,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error(
      'Something went wrong while retrieving monthly sales data.'
    );
  }
});

module.exports = {
  addSales,
  getMonthlySales,
  getSalesData,
  getTotalSalesAmount,
};
