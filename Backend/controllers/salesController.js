const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

// Helper function to retrieve products from inventory or pharmacy
const getValidProducts = async (productsSold) => {
  const productIds = productsSold.map((item) => item.productRefId);

  const productsInPharmacy = await Pharmacy.find({
    _id: { $in: productIds },
  });
  if (productsInPharmacy.length !== productsSold.length) {
    const missingProducts = productsSold.filter(
      (item) =>
        !productsInPharmacy.some((product) =>
          product._id.equals(item.productRefId)
        )
    );
    throw new Error(
      `Some drugs not found in pharmacy: ${missingProducts.map(
        (d) => d.productRefId
      )}`
    );
  }
  return productsInPharmacy;
};

// Helper function to validate stock and calculate income
const validateDrugAndCalculateIncome = async (drug, soldItem) => {
  console.log(drug, soldItem);
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
  const { soldItems, category, date } = req.body;
  let totalSale = 0;
  let totalNetIncome = 0;
  const soldDetails = [];

  try {
    // Step 1: Get valid products (pharmacy or inventory)
    const validProducts = await getValidProducts(soldItems, category);

    // Step 2: Loop through sold items to process each product sale
    for (const soldItem of soldItems) {
      const product = validProducts.find((p) =>
        p._id.equals(soldItem.productRefId)
      );

      // Step 3: Validate stock and calculate income for each product
      const income = await validateDrugAndCalculateIncome(product, soldItem);
      totalSale += income;

      // Step 4: Calculate net income
      const purchaseCost = await calculateNetIncome(product, soldItem);
      totalNetIncome += income - purchaseCost;

      // Step 5: Update product quantity in the correct location (pharmacy or inventory)
      await updateDrugStock(product, soldItem.quantity);

      // Step 6: Push sold item details to soldDetails array
      soldDetails.push({
        productRefId: product._id,
        quantity: soldItem.quantity,
        income,
      });
    }

    // Step 7: Create a sale record
    const sale = await Sale.create({
      soldDetails,
      totalSale,
      date,
      category,
      userID: req.user._id,
    });

    // Step 8: Create a income record
    await Income.create({
      date,
      totalNetIncome,
      category,
      description: `Sales of ${category} products`,
      userID: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: { sale },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to complete the sale: ${error.message}`,
    });
  }
});

const getAllSales = getAll(Sale, false, [
  { path: 'soldDetails.productRefId', select: 'name salePrice' },
  { path: 'userID', select: 'firstName lastName' },
]);

// Get monthly sales ( total income and total net income, total sold items )
const getOneMonthSales = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  try {
    // Get the first and last days of the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Aggregate sales data for the specified month, grouped by day
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
        $group: {
          _id: { $dayOfMonth: '$date' }, // Group by day of the month
          totalSale: { $sum: '$totalSale' },
          totalNetIncome: { $sum: '$totalNetIncome' },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by day in ascending order
      },
    ]);

    // If no sales found for the month
    if (!sales.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No sales found for the given month',
      });
    }

    // Return daily sales
    res.status(200).json({
      status: 'success',
      data: sales, // Array of sales grouped by day
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve monthly sales: ${error.message}`,
    });
  }
});

const getOneYearSales = asyncHandler(async (req, res) => {
  const { year } = req.params;

  // Define the start and end of the year
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  try {
    // Aggregate sales data grouped by month
    const incomeByMonth = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$date' }, // Group by month
          totalSale: { $sum: '$totalSale' },
          totalNetIncome: { $sum: '$totalNetIncome' },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month (ascending)
      },
    ]);

    // Create arrays for income and net income, each with 12 slots (one for each month)
    const incomeResult = new Array(12).fill(0);
    const netIncomeResult = new Array(12).fill(0);

    // Map the aggregated data to the arrays
    incomeByMonth.forEach((item) => {
      const monthIndex = item._id - 1; // Month is 1-indexed, array is 0-indexed
      incomeResult[monthIndex] = item.totalSale;
      netIncomeResult[monthIndex] = item.totalNetIncome;
    });

    // Respond with both income and net income arrays
    res.status(200).json({
      status: 'success',
      data: {
        incomeByMonth: incomeResult,
        netIncomeByMonth: netIncomeResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve yearly sales: ${error.message}`,
    });
  }
});

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

const updateSale = asyncHandler(async (req, res) => {
  const saleId = req.params.id;

  // Validate MongoDB ID
  validateMongoDBId(saleId);

  const { soldItems, category, date } = req.body;
  let totalSale = 0;
  let totalNetIncome = 0;
  const updatedSoldDetails = [];

  try {
    // Fetch the original sale to compare changes
    const originalSale = await Sale.findById(saleId);
    if (!originalSale) {
      res.status(404);
      throw new Error('Sale not found');
    }

    // Revert the stock based on the original sale quantities
    for (const originalItem of originalSale.soldDetails) {
      const product = await Pharmacy.findById(originalItem.productRefId);
      if (product) {
        product.quantity += originalItem.quantity; // Revert the quantity
        await product.save();
      }
    }

    // Validate and update based on the new soldItems
    const validProducts = await getValidProducts(soldItems);

    for (const soldItem of soldItems) {
      const product = validProducts.find((p) =>
        p._id.equals(soldItem.productRefId)
      );

      // Validate stock and calculate income for each updated product
      const income = await validateDrugAndCalculateIncome(product, soldItem);
      totalSale += income;

      // Calculate net income based on purchase cost
      const purchaseCost = await calculateNetIncome(product, soldItem);
      totalNetIncome += income - purchaseCost;

      // Update product quantity in the pharmacy
      await updateDrugStock(product, soldItem.quantity);

      // Add updated details to the soldDetails array
      updatedSoldDetails.push({
        productRefId: product._id,
        quantity: soldItem.quantity,
        income,
      });
    }

    // Update the sale record
    originalSale.soldDetails = updatedSoldDetails;
    originalSale.totalSale = totalSale;
    originalSale.date = date || originalSale.date;
    originalSale.category = category || originalSale.category;

    const updatedSale = await originalSale.save();

    // Update or create an income record
    const incomeRecord = await Income.findOneAndUpdate(
      {
        date: updatedSale.date,
        userID: req.user._id,
        category: updatedSale.category,
      },
      {
        totalNetIncome,
        description: `Updated sales of ${category} products`,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      data: { sale: updatedSale, income: incomeRecord },
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({
      status: 'error',
      message: `Failed to update the sale: ${error.message}`,
    });
  }
});

module.exports = {
  sellItems,
  getAllSales,
  getOneYearSales,
  getOneMonthSales,
  getOneMonthSalesWithFullDetails,
  updateSale,
};
