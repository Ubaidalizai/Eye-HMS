const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Product = require('../models/product');
const Purchase = require('../models/purchase');

const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

// Helper function to validate and retrieve drugs from the pharmacy
const getValidDrugsFromPharmacy = async (drugsSold) => {
  const drugIds = drugsSold.map((item) => item.drugId);
  const drugsInPharmacy = await Pharmacy.find({ _id: { $in: drugIds } });

  if (drugsInPharmacy.length !== drugsSold.length) {
    const missingDrugs = drugsSold.filter(
      (item) => !drugsInPharmacy.some((drug) => drug._id.equals(item.drugId))
    );
    throw new Error(
      `Some drugs not found: ${missingDrugs.map((d) => d.drugId)}`
    );
  }

  return drugsInPharmacy;
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

  const purchaseCost = purchaseRecord.TotalPurchaseAmount * soldItem.quantity;
  return purchaseCost; // Return the purchase cost for net income calculation
};

// Helper function to update drug quantity in the pharmacy
const updateDrugStock = async (drug, quantity) => {
  drug.quantity -= quantity;
  await drug.save();
};

// Main sellDrugs function
const sellDrugs = asyncHandler(async (req, res) => {
  const { drugsSold, date } = req.body;
  console.log(req.body);
  let totalIncome = 0;
  let totalNetIncome = 0;
  const soldItems = [];

  try {
    // Step 1: Get valid drugs from pharmacy
    const drugsInPharmacy = await getValidDrugsFromPharmacy(drugsSold);

    // Step 2: Loop through sold items to process each drug sale
    for (const soldItem of drugsSold) {
      const drug = drugsInPharmacy.find((d) => d._id.equals(soldItem.drugId));

      // Step 3: Validate stock and calculate income for each drug
      const income = await validateDrugAndCalculateIncome(drug, soldItem);
      totalIncome += income;

      // Step 4: Calculate net income
      const purchaseCost = await calculateNetIncome(drug, soldItem);
      totalNetIncome += income - purchaseCost;

      // Step 5: Update drug quantity in pharmacy
      await updateDrugStock(drug, soldItem.quantity);

      // Step 6: Push sold item details to soldItems array
      soldItems.push({
        drugId: drug._id,
        quantity: soldItem.quantity,
        income,
      });
    }

    // Step 7: Create a sale record
    const sale = await Sale.create({
      soldItems,
      totalIncome,
      totalNetIncome,
      date,
      soldBy: req.user._id,
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

// Get all sales data ( with pagination )
const getAllSales = asyncHandler(async (req, res) => {
  // Get page and limit from query params, set defaults if not provided
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Fetch sales with pagination
    const sales = await Sale.find()
      .populate({ path: 'soldItems.drugId', select: 'name salePrice' })
      .populate({ path: 'soldBy', select: 'firstName lastName' })
      .sort({ date: -1 }) // Sort by date, newest first
      .skip(skip)
      .limit(limit);

    // Get total count of sales for pagination metadata
    const totalSales = await Sale.countDocuments();

    res.status(200).json({
      status: 'success',
      results: sales.length,
      currentPage: page,
      totalPages: Math.ceil(totalSales / limit),
      data: {
        sales,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: `Failed to retrieve sales: ${error.message}`,
    });
  }
});

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
          totalSoldItems: { $sum: { $size: '$soldItems' } },
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
    throw new Error(
      'Something went wrong while retrieving monthly sales data.'
    );
  }
});

module.exports = { sellDrugs, getAllSales, getOneMonthSales, getMonthlySales };
