const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
const Pharmacy = require("../models/pharmacyModel");

// Add Post
const addProduct = (req, res) => {
  console.log(req.body);
  const addProduct = new Product({
    userID: req.body.userId,
    name: req.body.name,
    manufacturer: req.body.manufacturer,
    stock: 0,
    description: req.body.description,
    batchNumber: req.body.batchNumber,
    expiryDate: req.body.expiryDate,
  });

  addProduct
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
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
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error");
  }
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};

// move drug from inventory to pharmacy
const moveDrugsToPharmacy = async (req, res) => {
  const { name, quantity, salePrice } = req.body;
  console.log(req.body);
  try {
    // Find the drug in the inventory
    const product = await Product.findOne({ name: name });

    if (!product || product.stock < quantity) {
      return res
        .status(400)
        .json({ message: "Insufficient quantity in inventory" });
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
      pharmacyDrug = await Pharmacy.create({
        name,
        quantity,
        salePrice,
        // batchNumber: product.batchNumber,
        // expiryDate: product.expiryDate,
      });
    }

    await pharmacyDrug.save();

    res.status(200).json({ message: "Drugs moved to pharmacy successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  moveDrugsToPharmacy,
};
