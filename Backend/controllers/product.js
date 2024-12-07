const Product = require('../models/product');
const Sales = require('../models/salesModel');
const Purchase = require('../models/purchase');
const Pharmacy = require('../models/pharmacyModel');
const DrugMovement = require('../models/drugMovmentModel');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

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

  // Find the original product to retrieve its name and manufacturer before updating
  const originalProduct = await Product.findById(productID);
  if (!originalProduct) {
    throw new AppError('Product not found.', 404);
  }

  // Update the product details in the Product collection
  const updatedResult = await Product.findByIdAndUpdate(
    productID,
    {
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      category: req.body.category,
    },
    { new: true } // Return the updated document
  );

  if (!updatedResult) {
    throw new AppError('Failed to update product.', 400);
  }

  // Update the products in the Pharmacy collection with the new name and manufacturer
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
    }
  );

  // Send the success response
  res.status(200).json({
    status: 'success',
    data: {
      updatedProduct: updatedResult,
      updatedPharmacyProducts,
    },
  });
});

// Search Products
const searchProduct = getAll(Product, true);

// move drug from inventory to pharmacy
const moveDrugsToPharmacy = asyncHandler(async (req, res, next) => {
  const { name, manufacturer, quantity, salePrice, category, expiryDate } =
    req.body;

  if (!name || !manufacturer || !quantity || !salePrice || !category) {
    return next(new AppError('All fields are required', 400));
  }

  // Track changes for rollback
  let updatedInventory = null;
  let createdPharmacyDrug = null;
  let updatedPharmacyDrug = null;
  let createdDrugMovement = null;

  try {
    // Find the product in inventory
    const product = await Product.findOne({ name, manufacturer });
    if (!product) {
      throw new AppError('Drug not found in inventory', 404);
    }

    // Update inventory stock
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock in inventory', 400);
    }
    const previousStock = product.stock; // Capture current stock for rollback
    product.stock -= quantity;
    await product.save();
    updatedInventory = { product, previousStock }; // Record for rollback

    // Add or update drug in pharmacy
    let pharmacyDrug = await Pharmacy.findOne({ name, manufacturer });
    if (pharmacyDrug) {
      const previousQuantity = pharmacyDrug.quantity; // For rollback
      pharmacyDrug.quantity += quantity;
      pharmacyDrug.salePrice = salePrice; // Update sale price if needed
      await pharmacyDrug.save();
      updatedPharmacyDrug = { pharmacyDrug, previousQuantity }; // Track rollback info
    } else {
      pharmacyDrug = await Pharmacy.create({
        name,
        manufacturer,
        quantity,
        salePrice,
        category,
        expiryDate,
      });
      createdPharmacyDrug = pharmacyDrug; // Track for rollback
    }

    // Create a drug movement record
    const drugMovement = await DrugMovement.create({
      inventory_id: product._id,
      pharmacy_id: pharmacyDrug._id,
      quantity_moved: quantity,
      moved_by: req.user._id,
      category,
      expiryDate,
    });
    createdDrugMovement = drugMovement; // Track for rollback

    // Respond with success
    res.status(200).json({ message: 'Drugs moved to pharmacy successfully!' });
  } catch (error) {
    console.error('Error encountered, rolling back changes:', error);

    // Rollback inventory stock update
    if (updatedInventory) {
      const { product, previousStock } = updatedInventory;
      await Product.updateOne({ _id: product._id }, { stock: previousStock });
    }

    // Rollback pharmacy drug changes
    if (updatedPharmacyDrug) {
      const { pharmacyDrug, previousQuantity } = updatedPharmacyDrug;
      await Pharmacy.updateOne(
        { _id: pharmacyDrug._id },
        { quantity: previousQuantity }
      );
    }

    // Rollback pharmacy drug creation
    if (createdPharmacyDrug) {
      await Pharmacy.deleteOne({ _id: createdPharmacyDrug._id });
    }

    // Rollback drug movement record creation
    if (createdDrugMovement) {
      await DrugMovement.deleteOne({ _id: createdDrugMovement._id });
    }

    // Forward the error
    next(error);
  }
});

const checkProductExpiry = asyncHandler(async (req, res) => {
  const beforeThirtyDays = new Date();
  beforeThirtyDays.setDate(beforeThirtyDays.getDate() + 30);

  const expireProducts = await Product.find({
    expiryDate: { $lte: beforeThirtyDays },
    stock: { $gt: 0 },
  }); // Find products with an expiry date before 30 days

  if (expireProducts.length === 0) {
    return res.status(200).json({ message: 'No expired products found' });
  }

  res.status(200).json({ length: expireProducts.length, data: expireProducts });
});

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

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  moveDrugsToPharmacy,
  checkProductExpiry,
  getInventorySummary,
};
