const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

const validateMongoDBId = require('../utils/validateMongoDBId');
const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Helper function to validate stock and calculate income
const validateDrugAndCalculateIncome = (drug, { quantity }) => {
  // Check for sufficient stock
  if (drug.quantity < quantity) {
    throw new AppError(`Insufficient stock for drug: ${drug.name}`, 400);
  }

  // Validate sale price and quantity
  if (isNaN(drug.salePrice) || isNaN(quantity)) {
    throw new AppError(
      `Invalid sale price or quantity for drug: ${drug.name}`,
      400
    );
  }

  const income = drug.salePrice * quantity; // Calculate income
  return income; // Return the income
};

// Helper function to calculate net income
const calculateNetIncome = async (drug, { quantity }) => {
  // Find the product in inventory by name
  const productInInventory = await Product.findOne({ name: drug.name });

  if (!productInInventory) {
    throw new AppError(
      `Product with name ${drug.name} not found in inventory`,
      404
    );
  }

  // Calculate the purchase cost
  const purchaseCost = productInInventory.purchasePrice * quantity;
  return purchaseCost; // Return the purchase cost for net income calculation
};

// Helper function to update drug quantity in the pharmacy
const updateDrugStock = asyncHandler(async (drug, quantity) => {
  drug.quantity -= quantity;
  await drug.save();
});

// Main sellItems function
const sellItems = asyncHandler(async (req, res, next) => {
  const { soldItems } = req.body;

  if (!Array.isArray(soldItems) || !soldItems.length) {
    throw new AppError('No sold items provided.', 400);
  }

  const sales = [];
  const receipt = [];
  let totalIncome = 0;

  // Track changes for manual rollback
  const stockUpdates = [];
  const createdSales = [];
  const createdIncomes = [];

  try {
    for (const soldItem of soldItems) {
      const { productRefId, quantity, category, date } = soldItem;

      const drug = await Pharmacy.findById(productRefId);
      if (!drug) {
        throw new AppError(`Drug with ID ${productRefId} not found.`, 404);
      }

      const income = await validateDrugAndCalculateIncome(drug, {
        quantity,
      });
      const purchaseCost = await calculateNetIncome(drug, { quantity });
      const productNetIncome = income - purchaseCost;

      // Create a sale record
      const sale = await Sale.create({
        productRefId: drug._id,
        quantity,
        income,
        date,
        category,
        userID: req.user._id,
      });
      createdSales.push(sale);

      // Update product stock
      const previousStock = drug.quantity; // Capture current stock for rollback
      await updateDrugStock(drug, quantity);
      stockUpdates.push({ drug, previousStock }); // Record state for rollback

      // Create an income record
      const incomeRecord = await Income.create({
        saleId: sale._id,
        saleModel: 'pharmacyModel',
        date,
        totalNetIncome: productNetIncome,
        category,
        description: `Sale of ${drug.name} (${category})`,
        userID: req.user._id,
      });
      createdIncomes.push(incomeRecord);

      // Update response and receipt data
      sales.push(sale);
      totalIncome += income;
      receipt.push({
        productName: drug.name,
        quantity,
        income,
        category,
        date,
      });
    }

    // Generate the receipt object
    const generatedReceipt = {
      date: new Date().toISOString(),
      soldItems: receipt,
      totalIncome,
    };

    // Respond with the generated receipt
    res.status(201).json({
      status: 'success',
      data: {
        receipt: generatedReceipt,
      },
    });
  } catch (error) {
    // Rollback Changes
    console.error('Error encountered, rolling back changes:', error);

    // Rollback stock updates
    for (const { drug, previousStock } of stockUpdates) {
      await Pharmacy.updateOne({ _id: drug._id }, { stock: previousStock });
    }

    // Delete created sales and incomes
    for (const sale of createdSales) {
      await Sale.deleteOne({ _id: sale._id });
    }
    for (const income of createdIncomes) {
      await Income.deleteOne({ _id: income._id });
    }

    // Forward the error
    next(error);
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

  // Fetch the sale record
  const sale = await Sale.findById(saleId);
  if (!sale) {
    throw new AppError('Sale not found.', 404);
  }

  // Restore product quantity
  const product = await Pharmacy.findById(sale.productRefId);
  if (product) {
    product.quantity += sale.quantity; // Restore stock
    await product.save();
  }

  // Delete the income record associated with the sale
  const incomeRecord = await Income.findOne({ saleId });
  if (incomeRecord) {
    await Income.findByIdAndDelete(incomeRecord._id);
  }

  // Delete the sale record
  await Sale.findByIdAndDelete(saleId);

  // Send success response
  res.status(200).json({
    status: 'success',
    message: 'Sale deleted successfully.',
  });
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
