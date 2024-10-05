<<<<<<< HEAD
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
=======

const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
const Pharmacy = require("../models/pharmacyModel");
const DrugMovement = require("../models/drugMovmentModel");

// Add Post
const addProduct = (req, res) => {
  console.log(req.body);
  const addProduct = new Product({
    userID: req.body.userId,
>>>>>>> origin/master
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    stock: 0,
    description: req.body.description,
<<<<<<< HEAD
    category: req.body.category,
    // batchNumber: req.body.batchNumber,
    // expiryDate: req.body.expiryDate,
=======
    batchNumber: req.body.batchNumber,
    expiryDate: req.body.expiryDate,
>>>>>>> origin/master
  });

  addProduct
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
<<<<<<< HEAD
      console.log(err);
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
  // Update Product
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: productID },
=======
      res.status(402).send(err);
    });
};

// Get All Products
const getAllProducts = async (req, res) => {
  const findAllProducts = await Product.find({
    userID: req.params.userId,
  }).sort({ _id: -1 }); // -1 for descending;
  res.json(findAllProducts);
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  const deleteProduct = await Product.deleteOne({ _id: req.params.id });
  const deletePurchaseProduct = await Purchase.deleteOne({
    ProductID: req.params.id,
  });

  const deleteSaleProduct = await Sales.deleteOne({ ProductID: req.params.id });
  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: req.body.productID },
>>>>>>> origin/master
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
      },
      { new: true }
    );
<<<<<<< HEAD

    res.status(200).json({
      status: 'success',
      data: {
        updatedResult,
      },
    });
=======
    console.log(updatedResult);
    res.json(updatedResult);
>>>>>>> origin/master
  } catch (error) {
    console.log(error);
    res.status(402).send('Error');
  }
<<<<<<< HEAD
});

// Search Products
const searchProduct = getAll(Product, true);

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
=======
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: 'i' },
  });
  res.json(products);
};

// move drug from inventory to pharmacy
const moveDrugsToPharmacy = async (req, res) => {
  const { name, quantity, salePrice } = req.body;
  try {
    // Find the drug in the inventory
    const product = await Product.findOne({ name: name });

    if (!product || product.stock < quantity) {
      return res
        .status(400)
        .json({ message: 'Insufficient quantity in inventory' });
    }

    // Update the inventory quantity
    product.stock -= quantity;
    await product.save();

    // Check if the drug already exists in the pharmacy
    let pharmacyDrug = await Pharmacy.findOne({ name });

    if (pharmacyDrug) {
      // If exists, update the quantity
      pharmacyDrug.quantity += quantity;
      pharmacyDrug.salePrice = salePrice; // Update sale price if necessary
    } else {
      // If not, add a new entry to the pharmacy
>>>>>>> origin/master
      pharmacyDrug = await Pharmacy.create({
        name,
        quantity,
        salePrice,
        // batchNumber: product.batchNumber,
        // expiryDate: product.expiryDate,
      });
    }

    await pharmacyDrug.save();
<<<<<<< HEAD
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
=======

    // 4. Record the movement in the drugMovement collection
>>>>>>> origin/master
    await DrugMovement.create({
      inventory_id: product._id,
      pharmacy_id: pharmacyDrug._id,
      quantity_moved: quantity,
      moved_by: req.user._id, // Assuming user is available in req.user
    });

<<<<<<< HEAD
    // Step 6: Respond with success
    res.status(200).json({ message: 'Drugs moved to pharmacy successfully!' });
  } catch (error) {
    res.status(500);
    throw new Error('Internal server error');
  }
});
=======
    res.status(200).json({ message: "Drugs moved to pharmacy successfully!" });

  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};
>>>>>>> origin/master

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  moveDrugsToPharmacy,
};
