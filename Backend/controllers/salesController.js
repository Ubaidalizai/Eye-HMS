const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
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
const validateDrugAndCalculateIncome = async (drug, soldItem) => {
  if (drug.quantity < soldItem.quantity) {
    throw new Error(`Insufficient stock for drug: ${drug.name}`);
  }

  if (isNaN(drug.salePrice) || isNaN(soldItem.quantity)) {
    throw new Error(`Invalid sale price or quantity for drug: ${drug.name}`);
  }

  return drug.salePrice * soldItem.quantity; // Returns the income
};

// Helper function to calculate net income
const calculateNetIncome = async (drug, soldItem) => {
  const productInInventory = await Product.findOne({ name: drug.name });

  if (!productInInventory) {
    throw new Error(`Product with name ${drug.name} not found in inventory`);
  }

  const purchaseRecord = await Purchase.findOne({
    ProductID: productInInventory._id,
  });

  if (!purchaseRecord) {
    throw new Error(`No purchase record found for drug: ${drug.name}`);
  }

  const purchaseCost = purchaseRecord.UnitPurchaseAmount * soldItem.quantity;
  return purchaseCost; // Return the purchase cost for net income calculation
};

// Helper function to update drug quantity in the pharmacy
const updateDrugStock = async (drug, quantity) => {
  drug.quantity -= quantity;
  await drug.save();
};

// Main sellItems function
const sellItems = asyncHandler(async (req, res) => {
  const { soldItems } = req.body;

  // Validate request body
  if (!Array.isArray(soldItems) || !soldItems.length) {
    return res.status(400).json({ message: 'No sold items provided.' });
  }

  const sales = []; // Array to hold individual sale records for the response
  let totalIncome = 0; // Track total income for all sold items
  const receipt = []; // Array to hold receipt details

  try {
    // Step 1: Process each sold item
    for (const soldItem of soldItems) {
      const { productRefId, quantity, category, date } = soldItem;

      // Validate the product exists in pharmacy or inventory
      const product = await Pharmacy.findById(productRefId);
      if (!product) {
        throw new Error(
          `Product with ID ${productRefId} not found in pharmacy`
        );
      }

      // Validate stock and calculate income for the product
      const income = await validateDrugAndCalculateIncome(product, {
        quantity,
      });
      const purchaseCost = await calculateNetIncome(product, { quantity });
      const productNetIncome = income - purchaseCost;

      // Create a sale record for the individual product
      const sale = await Sale.create({
        productRefId: product._id,
        quantity,
        income,
        date,
        category,
        userID: req.user._id,
      });

      // Update product quantity in the pharmacy or inventory
      await updateDrugStock(product, quantity);

      // Create an income record associated with this sale
      await Income.create({
        saleId: sale._id, // Link this income entry to the sale record
        date,
        totalNetIncome: productNetIncome,
        category,
        description: `Sale of ${product.name} (${category})`,
        userID: req.user._id,
      });

      // Add the sale record to the response array
      sales.push(sale);
      totalIncome += income; // Update total income

      // Add details to the receipt
      receipt.push({
        productName: product.name,
        quantity,
        income,
        category,
        date,
      });
    }

    // Generate a printable receipt-like object
    const generatedReceipt = {
      date: new Date().toISOString(),
      soldItems: receipt,
      totalIncome,
    };

    // Respond with all the sale records created and the receipt
    res.status(201).json({
      status: 'success',
      data: {
        receipt: generatedReceipt, // Include the receipt in the response
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to complete the sale: ${error.message}`,
    });
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

  const { startDate, endDate } = getDateRangeForYear(year);

  const matchCriteria = {
    date: { $gte: startDate, $lte: endDate },
  };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: '$income' },
  };

  try {
    const data = await getAggregatedData(Model, matchCriteria, groupBy);
    const totalAmountsByDay = populateDataArray(data, 12, 'month');
    res.status(200).json({ data: totalAmountsByDay });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get sum of all Sales for a specific category (e.g., 'drug')
const getSalesCategoryTotal = asyncHandler(async (req, res) => {
  const category = req.query.category || 'drug'; // Get category from query params, default to 'drug'

  try {
    // Sum all income for the provided category
    const totalSales = await Sale.aggregate([
      { $match: { category: category } }, // Match the exact category
      { $group: { _id: null, total: { $sum: '$totalNetIncome' } } }, // Sum the 'totalNetIncome' field
    ]);

    // Check for total income and format the response
    const total = totalSales.length > 0 ? totalSales[0].total : 0;

    res.status(200).json({
      category,
      totalSales: total, // Set the field to totalSales as requested
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error calculating total Sales',
      error: error.message,
    });
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
    totalAmount: { $sum: '$income' },
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

// Get monthly sales ( total income and total net income, total sold items )
const getOneMonthSales = asyncHandler(async (req, res) =>
  getDataByMonth(req, res, Sale)
);

const getOneYearSales = asyncHandler(async (req, res) =>
  getDataByYear(req, res, Sale)
);

const getOneMonthSalesWithFullDetails = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  try {
    // Get the first and last days of the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Aggregate sales data for the specified month
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
        $unwind: '$userDetails', // Unwind the user details to get a single object
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

    // If no sales found for the month
    if (!sales.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No sales found for the given month',
      });
    }

    // Return sales details for the month
    res.status(200).json({
      status: 'success',
      data: sales, // Detailed sales data
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve monthly sales: ${error.message}`,
    });
  }
});

const deleteSale = asyncHandler(async (req, res) => {
  const saleId = req.params.id;
  // Validate MongoDB ID
  validateMongoDBId(saleId);

  try {
    // Fetch the original sale record
    const sale = await Sale.findById(saleId);
    if (!sale) {
      res.status(404);
      throw new Error('Sale not found');
    }

    // Step 1: Restore the product quantity in the pharmacy based on the sale
    const product = await Pharmacy.findById(sale.productRefId);
    if (product) {
      product.quantity += sale.quantity; // Restore the stock
      await product.save();
    }

    // Step 2: Delete or adjust the income record associated with the sale
    const incomeRecord = await Income.findOne({
      saleId: saleId, // Assuming saleId is stored in the income record
    });

    if (incomeRecord) {
      await Income.findByIdAndDelete(incomeRecord._id); // Delete associated income record
    }

    // Step 3: Delete the sale record
    await Sale.findByIdAndDelete(saleId);

    res.status(200).json({
      status: 'success',
      message: 'Sale deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({
      status: 'error',
      message: `Failed to delete the sale: ${error.message}`,
    });
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
