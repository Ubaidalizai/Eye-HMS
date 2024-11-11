const Product = require('../models/product');
const Sales = require('../models/salesModel');
const Purchase = require('../models/purchase');
const Pharmacy = require('../models/pharmacyModel');
const DrugMovement = require('../models/drugMovmentModel');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');

// Add Post
const addProduct = asyncHandler((req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id); // Check if _id is valid
  const addProduct = new Product({
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    stock: 0,
    description: req.body.description,
    category: req.body.category,
    // batchNumber: req.body.batchNumber,
    // expiryDate: req.body.expiryDate,
  });

  addProduct
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(402).send(err);
    });
});

const getAllProducts = getAll(Product);

// Delete Selected Product
const deleteSelectedProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id; // Get the product ID from the request parameters
  validateMongoDBId(productId); // Check if product ID is valid

  const productExist = await Product.findOne({ _id: productId });
  if (!productExist) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await Product.findByIdAndDelete({ _id: productId });

  // Send back the deletion results
  res.status(200).json({
    message: `${productExist.name}  deleted successfully`,
  });
});

// Update Selected Product
const updateSelectedProduct = asyncHandler(async (req, res) => {
  const productID = req.params.id;
  validateMongoDBId(productID); // Check if ProductID is valid

  try {
    // First, find the original product to get its name and manufacturer before updating
    const originalProduct = await Product.findById(productID);
    if (!originalProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update the product details
    const updatedResult = await Product.findByIdAndUpdate(
      productID,
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        category: req.body.category,
      },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(400).json({ message: 'Failed to update product' });
    }

    // Now update the products in the Pharmacy collection
    const updatedPharmacyProducts = await Pharmacy.updateMany(
      {
        name: originalProduct.name,
        manufacturer: originalProduct.manufacturer,
      }, // Find by original name and manufacturer
      {
        $set: {
          name: updatedResult.name,
          manufacturer: updatedResult.manufacturer,
        },
      }
    );

    if (!updatedPharmacyProducts) {
      throw new Error('Failed to update product details in the pharmacy');
    }

    res.status(200).json({
      status: 'success',
      data: {
        updatedProduct: updatedResult,
        updatedPharmacyProducts,
      },
    });
  } catch (error) {
    console.error('Error in updating product and pharmacy:', error);
    res.status(500).send({ message: 'Error updating product and pharmacy' });
  }
});

// Search Products
const searchProduct = getAll(Product, true);

// move drug from inventory to pharmacy
const moveDrugsToPharmacy = asyncHandler(async (req, res) => {
  // Function to update inventory stock
  const updateInventoryStock = async (product, quantity) => {
    product.stock -= quantity;
    await product.save();
  };

  // Function to add or update drug in pharmacy
  const addOrUpdatePharmacyDrug = async (
    name,
    manufacturer,
    quantity,
    salePrice,
    category,
    expiryDate
  ) => {
    let pharmacyDrug = await Pharmacy.findOne({ name, manufacturer });

    if (pharmacyDrug) {
      pharmacyDrug.quantity += quantity;
      pharmacyDrug.salePrice = salePrice; // Update sale price if needed
    } else {
      pharmacyDrug = await Pharmacy.create({
        name,
        manufacturer,
        quantity,
        salePrice,
        category,
        expiryDate,
      });
    }

    await pharmacyDrug.save();
    return pharmacyDrug;
  };

  try {
    const { name, manufacturer, quantity, salePrice, category, expiryDate } =
      req.body;
    console.log(req.body);
    // Step 1: Validate the product exists in inventory
    const product = await Product.findOne({ name, manufacturer });
    if (!product) {
      res.status(404);
      throw new Error('Drug not found in inventory');
    }
    // Step 2: Validate available stock
    if (product.stock < quantity) {
      res.status(400);
      throw new Error('Insufficient quantity in inventory');
    }

    // Step 3: Update inventory stock
    await updateInventoryStock(product, quantity);

    // Step 4: Add or update pharmacy drug record
    const pharmacyDrug = await addOrUpdatePharmacyDrug(
      name,
      manufacturer,
      quantity,
      salePrice,
      category,
      expiryDate
    );

    // Step 5: Record the movement in drug movement log
    await DrugMovement.create({
      inventory_id: product._id,
      pharmacy_id: pharmacyDrug._id,
      quantity_moved: quantity,
      moved_by: req.user._id, // Assuming user is available in req.user
      category,
      expiryDate,
    });

    // Step 6: Respond with success
    res.status(200).json({ message: 'Drugs moved to pharmacy successfully!' });
  } catch (error) {
    res.status(500);
    console.log(error);
    throw new Error('Internal server error');
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
