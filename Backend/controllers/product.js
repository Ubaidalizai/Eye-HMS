const Product = require('../models/product');
const Purchase = require('../models/purchase');
const Pharmacy = require('../models/pharmacyModel');
const DrugMovement = require('../models/drugMovmentModel');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');

// Add Post
const addProduct = asyncHandler((req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id); // Check if _id is valid
  const addProduct = new Product({
    userID: _id,
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
      console.log(err);
      res.status(402).send(err);
    });
});

// GET /api/products/drugs
const getDrugs = asyncHandler(async (req, res) => {
  try {
    const drugs = await Product.find({ category: 'drug' });
    res.status(200).json({ status: 'success', data: { drugs } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/products/sunglasses
const getSunglasses = asyncHandler(async (req, res) => {
  try {
    const sunglasses = await Product.find({ type: 'sunglasses' });
    res.status(200).json({ status: 'success', data: { sunglasses } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDBId(_id); // Check if _id is valid
  const products = await Product.find({
    userID: _id,
  }).sort({ _id: -1 }); // -1 for descending;
  if (!products) {
    res.status(404);
    throw new Error('Products not found');
  }

  res.status(200).json({
    status: 'success',
    data: {
      products,
    },
  });
});

// Delete Selected Product
const deleteSelectedProduct = asyncHandler(async (req, res) => {
  try {
    const productId = req.params.id;

    // Run all deletions in parallel for performance
    const [deleteProduct, deletePurchaseProduct, deleteSaleProduct] =
      await Promise.all([
        Product.deleteOne({ _id: productId }),
        Purchase.deleteOne({ ProductID: productId }),
        Sales.deleteOne({ ProductID: productId }),
      ]);

    // Check if product was actually deleted, and respond accordingly
    if (!deleteProduct.deletedCount) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Send back the deletion results
    res.status(200).json({
      message: 'Product and related records deleted successfully',
      deleteProduct,
      deletePurchaseProduct,
      deleteSaleProduct,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Internal server error');
  }
});

// Update Selected Product
const updateSelectedProduct = asyncHandler(async (req, res) => {
  const { productID } = req.body;
  validateMongoDBId(productID); // Check if ProductID is valid

  // Update Product
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: productID },
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: {
        updatedResult,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(402).send('Error');
  }
});

// Search Products
const searchProduct = asyncHandler(async (req, res) => {
  const { searchTerm } = req.query;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: 'i' },
  });

  if (!products) {
    res.status(404);
    throw new Error('Products not found');
  }
  res.status(200).json({
    status: 'success',
    data: {
      products,
    },
  });
});

// move drug from inventory to pharmacy
const moveDrugsToPharmacy = asyncHandler(async (req, res) => {
  const { name, quantity, salePrice } = req.body;

  // Function to update inventory stock
  const updateInventoryStock = async (product, quantity) => {
    product.stock -= quantity;
    await product.save();
  };

  // Function to add or update drug in pharmacy
  const addOrUpdatePharmacyDrug = async (name, quantity, salePrice) => {
    let pharmacyDrug = await Pharmacy.findOne({ name });

    if (pharmacyDrug) {
      pharmacyDrug.quantity += quantity;
      pharmacyDrug.salePrice = salePrice; // Update sale price if needed
    } else {
      pharmacyDrug = await Pharmacy.create({
        name,
        quantity,
        salePrice,
        // batchNumber: product.batchNumber,
        // expiryDate: product.expiryDate,
      });
    }

    await pharmacyDrug.save();
    return pharmacyDrug;
  };

  try {
    // Step 1: Find drug in the inventory
    const product = await Product.findOne({ name, category: 'drug' });
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
      quantity,
      salePrice
    );

    // Step 5: Record the movement in drug movement log
    await DrugMovement.create({
      inventory_id: product._id,
      pharmacy_id: pharmacyDrug._id,
      quantity_moved: quantity,
      moved_by: req.user._id, // Assuming user is available in req.user
    });

    // Step 6: Respond with success
    res.status(200).json({ message: 'Drugs moved to pharmacy successfully!' });
  } catch (error) {
    res.status(500);
    throw new Error('Internal server error');
  }
});

module.exports = {
  addProduct,
  getDrugs,
  getSunglasses,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  moveDrugsToPharmacy,
};
