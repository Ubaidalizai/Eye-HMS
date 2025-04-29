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
        quantity: 0, // Start with 0, we'll add after moving batches
        salePrice,
        minLevel,
        expireNotifyDuration,
        category,
        expiryDate,
      });
    }

    let remainingQty = quantity;

    // Step 3: Move from Purchase batches FIFO
    while (remainingQty > 0) {
      const batch = await Purchase.findOne({
        ProductID: product._id,
        QuantityPurchased: { $gt: 0 },
      })
        .sort({ date: 1 })
        .session(session);

      if (!batch) {
        throw new AppError('No available Purchase batch to move from', 400);
      }

      const moveQty = Math.min(batch.QuantityPurchased, remainingQty);

      // Decrease batch quantity
      batch.QuantityPurchased -= moveQty;
      await batch.save({ session });

      // Increase pharmacy stock
      pharmacyItem.quantity += moveQty;

      // Create Drug Movement record
      await DrugMovement.create(
        [
          {
            inventory_id: product._id,
            purchase_id: batch._id, // Optional: track from which purchase batch
            quantity_moved: moveQty,
            moved_by: req.user._id,
            category,
            expiryDate: batch.expiryDate || expiryDate,
          },
        ],
        { session }
      );

      remainingQty -= moveQty;
    }

    // Step 4: Save updated pharmacy item
    await pharmacyItem.save({ session });

    // Step 5: Decrease inventory stock
    product.stock -= quantity;
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
