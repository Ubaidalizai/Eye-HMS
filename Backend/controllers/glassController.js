const Glass = require('../models/glassesModel');
const validateMongoDBId = require('../utils/validateMongoDBId');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

const getAll = require('./handleFactory');

// Add Post
const addGlass = asyncHandler(async (req, res, next) => {
  const { id } = req.user;

  // Validate MongoDB ID
  validateMongoDBId(id);

  // Validate required fields
  const { name, manufacturer, minLevel, category } = req.body;
  if (!name || !minLevel || !category) {
    throw new AppError(
      'All fields (name, manufacturer, min level, category) are required.',
      400
    );
  }

  const glassExist = await Glass.findOne({ name, manufacturer });
  if (glassExist) {
    throw new AppError('Glass already exists.', 400);
  }

  // Create a new glass
  const newGlass = await Glass.create({
    name,
    manufacturer,
    quantity: 0,
    purchasePrice: 0,
    salePrice: 0,
    minLevel,
    category,
  });

  // Send success response
  res.status(201).json({
    status: 'success',
    data: newGlass,
  });
});

const getAllGlasses = getAll(Glass);

const getGlassById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const glass = await Glass.findById(id);
  if (!glass) {
    throw new AppError('Glass not found with the requested ID.', 404);
  }

  res.status(200).json({
    status: 'success',
    data: glass,
  });
});

const deleteGlass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const glassExist = await Glass.findById(id);
  if (!glassExist) {
    throw new AppError('Glass not found.', 404);
  }

  // Delete the product
  await Glass.findByIdAndDelete(id);

  // Send success response
  res.status(200).json({
    status: 'success',
    message: `${glassExist.name} deleted successfully.`,
  });
});

const updateGlass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  // Check if the glass exists
  const glass = await Glass.findById(id);
  if (!glass) {
    throw new AppError('Glass not found.', 404);
  }

  // Check for duplication (exclude the current glass's ID)
  const glassExist = await Glass.findOne({
    name: req.body.name || glass.name,
    manufacturer: req.body.manufacturer || glass.manufacturer,
    _id: { $ne: id }, // Exclude the current glass
  });
  if (glassExist) {
    throw new AppError(
      'Glass with the same name and manufacturer already exists.',
      400
    );
  }

  // Update the glass
  const updatedResult = await Glass.findByIdAndUpdate(
    id,
    {
      name: req.body.name || glass.name,
      manufacturer: req.body.manufacturer || glass.manufacturer,
      salePrice: req.body.salePrice || glass.salePrice,
      minLevel: req.body.minLevel || glass.minLevel,
      category: req.body.category || glass.category,
    },
    { new: true }
  );

  if (!updatedResult) {
    throw new AppError('Failed to update the glass.', 400);
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedGlass: updatedResult,
    },
  });
});
// Get Glasses Summary
const getGlassesSummary = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const matchStage = category ? { category: category } : {};

  // Total quantity
  const result = await Glass.aggregate([
    { $match: matchStage },
    {
      $project: {
        totalValue: { $multiply: ['$salePrice', '$quantity'] },
        isLowStock: { $cond: [{ $lte: ['$quantity', '$minLevel'] }, 1, 0] },
        quantity: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalProductSalesValue: { $sum: '$totalValue' },
        totalCount: { $sum: 1 },
        lowStockCount: { $sum: '$isLowStock' },
        totalStock: { $sum: '$quantity' },
      },
    },
  ]);

  const totalSalePrice = result[0]?.totalProductSalesValue || 0;
  const totalCount = result[0]?.totalCount || 0;
  const lowStockCount = result[0]?.lowStockCount || 0;
  const totalStock = result[0]?.totalStock || 0;

  res.status(200).json({
    totalSalePrice,
    length: totalCount,
    lowStockCount,
    totalStock,
  });
});

module.exports = {
  addGlass,
  getAllGlasses,
  getGlassById,
  deleteGlass,
  updateGlass,
  getGlassesSummary,
};
