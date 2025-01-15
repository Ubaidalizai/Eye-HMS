const Product = require('../models/product');
const Pharmacy = require('../models/pharmacyModel');
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
  const { name, manufacturer, quantity, salePrice, category, expiryDate } =
    req.body;

  if (!name || !manufacturer || !quantity || !salePrice || !category) {
    throw new AppError('All fields are required', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the product in inventory
    const product = await Product.findOne({ name, manufacturer }).session(
      session
    );
    if (!product) {
      throw new AppError('Drug not found in inventory', 404);
    }

    // Step 2: Update inventory stock
    if (product.stock < quantity) {
      throw new AppError('Insufficient stock in inventory', 400);
    }

    product.stock -= quantity;
    await product.save({ session });

    // Step 3: Add or update drug in pharmacy
    let pharmacyDrug = await Pharmacy.findOne({ name, manufacturer }).session(
      session
    );

    if (pharmacyDrug) {
      pharmacyDrug.quantity += quantity;
      pharmacyDrug.salePrice = salePrice; // Update sale price if needed
      await pharmacyDrug.save({ session });
    } else {
      pharmacyDrug = new Pharmacy({
        name,
        manufacturer,
        quantity,
        salePrice,
        category,
        expiryDate,
      });
      await pharmacyDrug.save({ session });
    }

    // Step 4: Create a drug movement record
    await DrugMovement.create(
      [
        {
          inventory_id: product._id,
          quantity_moved: quantity,
          moved_by: req.user._id,
          category,
          expiryDate,
        },
      ],
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with success
    res.status(200).json({ message: 'Drugs moved to pharmacy successfully!' });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
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
