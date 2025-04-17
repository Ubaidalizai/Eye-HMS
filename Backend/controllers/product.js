const mongoose = require('mongoose');
const Product = require('../models/product');
const Sales = require('../models/salesModel');
const Purchase = require('../models/purchase');
const Pharmacy = require('../models/pharmacyModel');
const DrugMovement = require('../models/drugMovmentModel');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const checkExpiry = require('../utils/checkExpiry');

const getAll = require('./handleFactory');

// Add Post
const addProduct = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;

  // Validate MongoDB ID
  validateMongoDBId(_id);

  // Validate required fields
  const { name, manufacturer, description, category } = req.body;
  if (!name || !manufacturer || !description || !category) {
    return next(
      new AppError(
        'All fields (name, manufacturer, description, category) are required.',
        400
      )
    );
  }

  // Create a new product
  const newProduct = await Product.create({
    name,
    manufacturer,
    stock: 0, // Default stock is 0
    purchasePrice: 0, // Default purchase price is 0
    salePrice: 0, // Default sale price is 0
    description,
    category,
  });

  // Send success response
  res.status(201).json({
    status: 'success',
    data: newProduct,
  });
});

const getAllProducts = getAll(Product);

// Delete Selected Product
const deleteSelectedProduct = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  // Validate MongoDB ID
  validateMongoDBId(productId);

  // Check if product exists
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError('Product not found.', 404));
  }

  // Delete the product
  await Product.findByIdAndDelete(productId);

  // Send success response
  res.status(200).json({
    status: 'success',
    message: `${productExist.name} deleted successfully.`,
  });
});

// Update Selected Product
const updateSelectedProduct = asyncHandler(async (req, res, next) => {
  const productID = req.params.id;

  // Validate MongoDB ID
  validateMongoDBId(productID);

  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the original product
    const originalProduct = await Product.findById(productID).session(session);
    if (!originalProduct) {
      throw new AppError('Product not found.', 404);
    }

    // Step 2: Update the product details in the Product collection
    const updatedResult = await Product.findByIdAndUpdate(
      productID,
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        category: req.body.category,
      },
      { new: true, session } // Return the updated document and bind the session
    );

    if (!updatedResult) {
      throw new AppError('Failed to update product.', 400);
    }

    // Step 3: Update the related products in the Pharmacy collection
    const updatedPharmacyProducts = await Pharmacy.updateMany(
      {
        name: originalProduct.name,
        manufacturer: originalProduct.manufacturer,
      }, // Match by original name and manufacturer
      {
        $set: {
          name: updatedResult.name,
          manufacturer: updatedResult.manufacturer,
        },
      },
      { session } // Bind the session to the operation
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send the success response
    res.status(200).json({
      status: 'success',
      data: {
        updatedProduct: updatedResult,
        updatedPharmacyProducts,
      },
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(
      new AppError(
        'Failed to update product and related pharmacy records.',
        500
      )
    );
  }
});

// Search Products
const searchProduct = getAll(Product, true);

const checkProductExpiry = checkExpiry(Product, 'expiryDate');

// Get Inventory Summary
const getInventorySummary = async (req, res) => {
  try {
    // Total Products Count
    const totalProductsCount = await Product.countDocuments();

    // Total Stock
    const totalStock = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' }, // Assuming the stock field is in each product document
        },
      },
    ]);

    // Low Stock Count (for example, stock less than 10)
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });

    res.status(200).json({
      status: 'success',
      data: {
        totalProductsCount,
        totalStock: totalStock[0]?.totalStock || 0, // Check for empty result
        lowStockCount,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get inventory summary',
      error: err.message,
    });
  }
};

const giveProductExpireByMonth = asyncHandler(async (req, res) => {
  const months = parseInt(req.params.months, 10);

  if (isNaN(months) || months < 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid months value in URL',
    });
  }

  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(now.getMonth() + months); // Future date after specified months
  
  // Set the future date to include the end of the month (e.g., until the end of that month)
  futureDate.setHours(23, 59, 59, 999); 

  const pastDate = new Date();
  pastDate.setMonth(now.getMonth() - months); // Past date based on months ago
  
  // Ensure to include the start of the past date as the range start
  pastDate.setHours(0, 0, 0, 0); 

  // Find expired items that match the exact expiration date or fall within the range
  const expiringProducts = await Product.find({
    expiryDate: { $gte: pastDate, $lte: futureDate },
    stock: { $gt: 0 }, // Only products with stock available
  });

  res.status(200).json({
    status: 'success',
    length: expiringProducts.length,
    data: { expiringProducts },
  });
});




module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  checkProductExpiry,
  getInventorySummary,
  giveProductExpireByMonth
};
