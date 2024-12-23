const Bedroom = require('../models/bedroomModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

// Create a new bedroom
const createBedroom = asyncHandler(async (req, res) => {
  try {
    const bedroom = new Bedroom(req.body);
    await bedroom.save();

    res.status(201).json({
      success: true,
      message: 'Bedroom created successfully',
      data: bedroom,
    });
  } catch (error) {
    // Handle database errors (e.g., validation)
    if (error.name === 'ValidationError') {
      throw new AppError(`Invalid input: ${error.message}`, 400);
    }

    // Re-throw unexpected errors
    throw error;
  }
});

// Get all bedrooms
const getAllBedrooms = getAll(Bedroom);

// Get a bedroom by schema `id`
const getBedroomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOne({ id }); // Find by schema-defined `id`

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom retrieved successfully',
    data: bedroom,
  });
});

// Update a bedroom by schema `id`
const updateBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOneAndUpdate({ id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom updated successfully',
    data: bedroom,
  });
});

// Delete a bedroom by schema `id`
const deleteBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOneAndDelete({ id });

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom deleted successfully',
  });
});

module.exports = {
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
};
