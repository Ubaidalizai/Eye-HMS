const Sale = require('../models/salesModel'); // Sale model
const Purchase = require('../models/purchase'); // Purchase model
const Expense = require('../models/ExpensesModule'); // Expense model
const Product = require('../models/product'); // Product model

// Get Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
  try {
    // Total Products
    const totalProductsCount = await Product.countDocuments();

    // Total Sales
    const totalSales = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: '$totalSale' },
        },
      },
    ]);

    // Total Purchases
    const totalPurchases = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalPurchaseAmount: { $sum: '$TotalPurchaseAmount' },
        },
      },
    ]);

    // Total Expenses
    const totalExpenses = await Expense.aggregate([
      {
        $group: {
          _id: null,
          totalExpenseAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Total Income (Total Sales - Total Purchases - Total Expenses)
    const totalIncome =
      (totalSales[0]?.totalSaleAmount || 0) -
      (totalPurchases[0]?.totalPurchaseAmount || 0) -
      (totalExpenses[0]?.totalExpenseAmount || 0);

    res.status(200).json({
      status: 'success',
      data: {
        totalProductsCount,
        totalSales: totalSales[0]?.totalSaleAmount || 0,
        totalPurchases: totalPurchases[0]?.totalPurchaseAmount || 0,
        totalExpenses: totalExpenses[0]?.totalExpenseAmount || 0,
        totalIncome,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get dashboard summary',
      error: err.message,
    });
  }
};
