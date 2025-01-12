const Product = require('../models/product');
const Pharmacy = require('../models/pharmacyModel');
const DrugMovement = require('../models/drugMovmentModel');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

const getAllProductMovements = getAll(DrugMovement, false);

// move drug from inventory to pharmacy
const moveProductsToPharmacy = asyncHandler(async (req, res, next) => {
  const { name, manufacturer, quantity, salePrice, category, expiryDate } =
    req.body;

  if (!name || !manufacturer || !quantity || !salePrice || !category) {
    throw new AppError('All fields are required', 400);
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
      productName: product.name,
      quantity_moved: quantity,
      moved_by: req.user.firstName,
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

const deleteMovement = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDBId(id);

  await DrugMovement.findByIdAndDelete(id);

  res.status(200).json({ message: 'Movement deleted successfully' });
});

module.exports = {
  getAllProductMovements,
  moveProductsToPharmacy,
  deleteMovement,
};
