const mongoose = require('mongoose');
const Product = require('../models/product');
const Pharmacy = require('../models/pharmacyModel');
const Purchase = require('../models/purchase');
const DrugMovement = require('../models/drugMovmentModel');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

const getAllProductMovements = getAll(DrugMovement, false, [
  {
    path: 'inventory_id',
    select: 'name',
  },
  {
    path: 'moved_by',
    select: 'firstName lastName',
  },
]);

// move drug from inventory to pharmacy
const moveProductsToPharmacy = asyncHandler(async (req, res, next) => {
  const {
    name,
    manufacturer,
    quantity,
    salePrice,
    minLevel,
    expireNotifyDuration,
    category,
    expiryDate,
  } = req.body;

  if (!name || !manufacturer || !quantity || !salePrice || !category) {
    throw new AppError('All fields are required', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find product in inventory
    const product = await Product.findOne({ name, manufacturer }).session(
      session
    );
    if (!product) {
      throw new AppError('Product not found in inventory', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Insufficient inventory stock. Available: ${product.stock}`,
        400
      );
    }

    // Step 2: Find or create pharmacy item
    let pharmacyItem = await Pharmacy.findOne({ name, manufacturer }).session(
      session
    );
    if (!pharmacyItem) {
      pharmacyItem = new Pharmacy({
        name,
        manufacturer,
        quantity,
        salePrice,
        minLevel,
        expireNotifyDuration,
        category,
        expiryDate,
      });
    } else {
      // Step 3: Update pharmacy item
      pharmacyItem.quantity += Number(quantity);
      pharmacyItem.salePrice = Number(salePrice);
      pharmacyItem.expiryDate = expiryDate;
    }

    // Create Drug Movement record
    await DrugMovement.create(
      [
        {
          inventory_id: product._id,
          quantity_moved: Number(quantity),
          moved_by: req.user._id,
          category,
          expiryDate,
        },
      ],
      { session }
    );

    // Step 4: Save updated pharmacy item
    await pharmacyItem.save({ session });

    // Step 5: Decrease inventory stock and update sale price
    product.stock -= quantity;
    product.salePrice = Number(salePrice) || product.salePrice;
    await product.save({ session });

    // Step 6: Commit transaction
    await session.commitTransaction();
    session.endSession();

    res
      .status(200)
      .json({ message: 'Products moved to pharmacy successfully!' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const errorMessage = error.message || 'Failed to move products to pharmacy';
    throw new AppError(errorMessage, error.statusCode || 500);
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
