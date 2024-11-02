const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Purchase = require('../models/purchase');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

// Helper function to retrieve products from inventory or pharmacy
const getValidProduct = async (productRefId) => {
  const productInPharmacy = await Pharmacy.findById(productRefId);

  if (!productInPharmacy) {
    throw new Error(`Product with ID ${productRefId} not found in pharmacy`);
  }

  return productInPharmacy;
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
const sellItems = asyncHandler(async (req, res) => {
  const { productRefId, quantity, category, date } = req.body;

  try {
    // Step 1: Validate the product exists in pharmacy or inventory
    const product = await Pharmacy.findById(productRefId);
    if (!product) {
      throw new Error(`Product with ID ${productRefId} not found in pharmacy`);
    }

    // Step 2: Validate stock and calculate income for the product
    const income = await validateDrugAndCalculateIncome(product, { quantity });
    const purchaseCost = await calculateNetIncome(product, { quantity });
    const productNetIncome = income - purchaseCost;

    // Step 3: Create a sale record for the single product (now using productRefId)
    const sale = await Sale.create({
      productRefId: product._id,
      quantity,
      income,
      date,
      category,
      userID: req.user._id,
    });

    // Step 4: Update product quantity in the pharmacy or inventory
    await updateDrugStock(product, quantity);

    // Step 5: Create an income record associated with this sale
    await Income.create({
      saleId: sale._id, // Link this income entry to the sale record
      date,
      totalNetIncome: productNetIncome,
      category,
      description: `Sale of ${product.name} (${category})`,
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
  { path: 'productRefId', select: 'name salePrice' },
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

    // Revert stock based on original sale quantities
    let productNetIncomeDifference = 0;
    for (const originalItem of originalSale.soldDetails) {
      const product = await Pharmacy.findById(originalItem.productRefId);
      if (product) {
        product.quantity += originalItem.quantity; // Revert the quantity
        await product.save();
      }
    }

    // Validate and update based on new soldItems
    const validProducts = await getValidProducts(soldItems);

    for (const soldItem of soldItems) {
      const product = validProducts.find((p) =>
        p._id.equals(soldItem.productRefId)
      );

      // Find original item income, then calculate the difference
      const originalItem = originalSale.soldDetails.find((item) =>
        item.productRefId.equals(soldItem.productRefId)
      );
      const originalNetIncome = originalItem ? originalItem.income : 0;

      // Calculate updated income and net income for the product
      const income = await validateDrugAndCalculateIncome(product, soldItem);
      const purchaseCost = await calculateNetIncome(product, soldItem);
      const newNetIncome = income - purchaseCost;

      // Calculate the difference for this specific product
      productNetIncomeDifference += newNetIncome - originalNetIncome;
      totalSale += income;
      totalNetIncome += newNetIncome;

      // Update product quantity in the pharmacy
      await updateDrugStock(product, soldItem.quantity);

      // Add updated details to soldDetails array
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

    // Adjust the income record based on productNetIncomeDifference
    await Income.findOneAndUpdate(
      { saleId: saleId },
      {
        $inc: { totalNetIncome: productNetIncomeDifference }, // Decrement by productNetIncomeDifference
        description: `Updated sales of ${category} products`,
        date: date || originalSale.date,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      data: { sale: updatedSale },
    });
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({
      status: 'error',
      message: `Failed to update the sale: ${error.message}`,
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
  updateSale,
  deleteSale,
};
