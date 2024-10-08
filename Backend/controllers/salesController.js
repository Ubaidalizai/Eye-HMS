const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
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
// Updated sellItems function to handle both pharmacy and inventory products
const sellItems = asyncHandler(async (req, res) => {
  const { soldItems, category, date } = req.body;
  let totalIncome = 0;
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
      totalIncome += income;

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
      totalIncome,
      totalNetIncome,
      date,
      category,
      userID: req.user._id,
    });

    res.status(201).json({
      status: 'success',
      data: { sale },
    });
  } catch (error) {
    console.log(error);
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
        $group: {
          _id: null,
          totalIncome: { $sum: '$totalIncome' },
          totalNetIncome: { $sum: '$totalNetIncome' },
          totalSoldItems: { $sum: { $size: '$soldDetails' } },
        },
      },
    ]);

    // If no sales found for the month
    if (!sales.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No sales found for the given month',
      });
    }

    res.status(200).json({
      status: 'success',
      data: sales[0],
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve monthly sales: ${error.message}`,
    });
  }
});

const getMonthlySales = asyncHandler(async (req, res) => {
  try {
    // Aggregate monthly sales amount by using MongoDB's aggregation framework
    const salesByMonth = await Sale.aggregate([
      {
        $group: {
          _id: { $month: '$date' }, // Extract month from the date field
          totalIncome: { $sum: '$totalIncome' }, // Sum up the totalIncome for each month
        },
      },
    ]);
    // Initialize an array with 12 zeros for each month
    const salesAmount = Array(12).fill(0);

    // Populate the salesAmount array with the results from the aggregation
    salesByMonth.forEach((sale) => {
      const monthIndex = sale._id - 1; // Month index (0 for January, 11 for December)
      salesAmount[monthIndex] = sale.totalIncome;
    });

    res.status(200).json({
      status: 'success',
      data: {
        salesAmount,
      },
    });
  } catch (error) {
    res.status(500);
    console.log(error);
    throw new Error(
      'Something went wrong while retrieving monthly sales data.'
    );
  }
});

module.exports = { sellItems, getAllSales, getOneMonthSales, getMonthlySales };
