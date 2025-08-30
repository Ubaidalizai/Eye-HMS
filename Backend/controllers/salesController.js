const mongoose = require('mongoose');
const Pharmacy = require('../models/pharmacyModel');
const Sale = require('../models/salesModel');
const Income = require('../models/incomeModule');
const Product = require('../models/product');
const Glass = require('../models/glassesModel');
const Purchase = require('../models/purchase');
const User = require('../models/userModel');
const DoctorKhata = require('../models/doctorKhataModel');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const PharmacySalesTotal = require('../models/PharmacySalesTotal');

const validateMongoDBId = require('../utils/validateMongoDbId');
const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

const createSaleAndIncome = async ({
  item,
  sellQty,
  category,
  date,
  userID,
  saleModel,
  productModel,
  batch,
  session,
  discount = 0, // already proportional
  finalPrice = 0, // already calculated
}) => {
  const income = item.salePrice * sellQty; // always gross/original

  // Save Sale record
  const sale = await Sale.create(
    [
      {
        purchaseRefId: batch?._id || null,
        productRefId: item._id,
        productModel,
        quantity: sellQty,
        income, // gross/original
        discount, // proportional discount
        finalPrice, // after discount
        date,
        category,
        userID,
      },
    ],
    { session }
  );

  // Net income based on discounted finalPrice
  const purchaseCost =
    (batch ? batch.UnitPurchaseAmount : item.purchasePrice) * sellQty;
  const netIncome = finalPrice - purchaseCost;

  if (netIncome > 0) {
    await Income.create(
      [
        {
          saleId: sale[0]._id,
          saleModel,
          date,
          totalNetIncome: netIncome,
          category,
          description: `Sale of ${item.name} (${category})`,
          userID,
        },
      ],
      { session }
    );
  }

  return sale[0];
};

const updateLedger = async (LedgerModel, amount, session) => {
  const ledger =
    (await LedgerModel.findById('singleton').session(session)) ||
    new LedgerModel({ _id: 'singleton', totalSalesAmount: 0 });
  ledger.totalSalesAmount += amount;
  await ledger.save({ session });
};

const addToReceipt = (
  receipt,
  name,
  qty,
  income,
  proportionalDiscount,
) => {
  const line = receipt.find((line) => line.productName === name);
  if (line) {
    line.quantity += qty;
    line.income += income;
    line.proportionalDiscount += proportionalDiscount;
  } else {
    receipt.push({
      productName: name,
      quantity: qty,
      income,
      proportionalDiscount,
    });
  }
};

// Main sellItems function
const sellItems = asyncHandler(async (req, res) => {
  const { soldItems, discount = 0 } = req.body;

  if (!Array.isArray(soldItems) || !soldItems.length) {
    throw new AppError('No sold items provided.', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const receipt = [];
    let totalIncome = 0;

    // 1️⃣ Separate discountable items
    const discountableItems = soldItems.filter((i) =>
      ['glass', 'frame', 'sunglasses'].includes(i.category)
    );

    // 2️⃣ Compute total income of discountable items
    let discountableTotal = 0;
    for (const { productRefId, quantity } of discountableItems) {
      const glass = await Glass.findById(productRefId).session(session);
      discountableTotal += glass.salePrice * quantity;
    }

    for (const {
      productRefId,
      quantity,
      category,
      date = new Date(),
    } of soldItems) {
      if (category === 'drug') {
        const pharmacy = await Pharmacy.findById(productRefId).session(session);
        if (!pharmacy || pharmacy.quantity < quantity)
          throw new AppError(
            `Invalid or insufficient stock for ${productRefId}`,
            400
          );

        const product = await Product.findOne({ name: pharmacy.name }).session(
          session
        );
        if (!product)
          throw new AppError(`Inventory not found for ${pharmacy.name}`, 404);

        let remainingQty = quantity;
        while (remainingQty > 0) {
          const batch = await Purchase.findOne({
            ProductID: product._id,
            QuantityPurchased: { $gt: 0 },
          })
            .sort({ date: 1 })
            .session(session);

          if (!batch)
            throw new AppError(`No available batch for ${pharmacy.name}`, 400);

          const sellQty = Math.min(batch.QuantityPurchased, remainingQty);
          const sale = await createSaleAndIncome({
            item: pharmacy,
            sellQty,
            category,
            date,
            userID: req.user._id,
            saleModel: 'pharmacyModel',
            productModel: 'Pharmacy',
            batch,
            session,
          });

          batch.QuantityPurchased -= sellQty;
          await batch.save({ session });

          pharmacy.quantity -= sellQty;
          await pharmacy.save({ session });

          await updateLedger(PharmacySalesTotal, sale.income, session);
          addToReceipt(
            receipt,
            pharmacy.name,
            sellQty,
            sale.income,
            category,
          );

          totalIncome += sale.income;
          remainingQty -= sellQty;
        }
      } else if (['glass', 'frame', 'sunglasses'].includes(category)) {
        const glass = await Glass.findById(productRefId).session(session);
        if (!glass || glass.quantity < quantity) {
          throw new AppError(
            `Invalid or insufficient stock for ${glass?.name || productRefId}`,
            400
          );
        }

        const income = glass.salePrice * quantity;

        // 4️⃣ Proportional discount share
        const proportionalDiscount =
          discountableTotal > 0 ? (income / discountableTotal) * discount : 0;

        const finalPrice = income - proportionalDiscount;

        const sale = await createSaleAndIncome({
          item: glass,
          sellQty: quantity,
          category,
          date,
          userID: req.user._id,
          saleModel: 'glassModel',
          productModel: 'Glass',
          session,
          discount: proportionalDiscount, // 👈 pass ready values
          finalPrice,
        });

        // reduce stock
        glass.quantity -= quantity;
        await glass.save({ session });

        addToReceipt(
          receipt,
          glass.name,
          quantity,
          income,
          proportionalDiscount,
        );

        totalIncome += finalPrice;
      } else {
        throw new AppError(`Unsupported category: ${category}`, 400);
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: 'success',
      data: {
        receipt: {
          date: new Date().toISOString(),
          soldItems: receipt,
          discount,
          totalIncome,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      err.message || 'Failed to complete sale',
      err.statusCode || 500
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
  if (category === 'drug') {
    matchCriteria.category = category;
  } else if (category) {
    // Must be one of the non-drug categories
    matchCriteria.category = category;
  } else {
    // No category provided — fetch all NON-drug stats
    matchCriteria.category = { $in: ['glass', 'frame', 'sunglasses'] };
  }

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
  if (category === 'drug') {
    matchCriteria.category = category;
  } else if (category) {
    // Must be one of the non-drug categories
    matchCriteria.category = category;
  } else {
    // No category provided — fetch all NON-drug stats
    matchCriteria.category = { $in: ['glass', 'frame', 'sunglasses'] };
  }

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
  validateMongoDBId(saleId);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the sale record
    const sale = await Sale.findById(saleId).session(session);
    if (!sale) {
      throw new AppError('Sale not found.', 404);
    }

    const { productRefId, purchaseRefId, quantity, category } = sale;

    // Step 2: Restore stock based on category
    if (category === 'drug') {
      const pharmacyProduct = await Pharmacy.findById(productRefId).session(
        session
      );
      if (pharmacyProduct) {
        pharmacyProduct.quantity += quantity;
        await pharmacyProduct.save({ session });
      }

      const saleRecord = await Sale.findById(saleId).session(session);
      updateLedger(PharmacySalesTotal, -saleRecord.income, session);

      // Restore quantity to the purchase batch
      const purchaseBatch = await Purchase.findById(purchaseRefId).session(
        session
      );
      if (purchaseBatch) {
        purchaseBatch.QuantityPurchased += quantity;
        await purchaseBatch.save({ session });
      }
    } else {
      // Handle sunglasses, glass, frame
      const glassItem = await Glass.findById(productRefId).session(session);
      if (glassItem) {
        glassItem.quantity += quantity;
        await glassItem.save({ session });
      }
    }

    // Step 3: Delete related income
    await Income.deleteOne({ saleId }).session(session);

    // Step 4: Delete the sale record
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
