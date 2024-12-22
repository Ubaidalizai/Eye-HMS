const Yeglizer = require('../models/yeglizerModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');

// Get all Yeglizer records
const getAllYeglizers = getAll(Yeglizer);

// Get a single Yeglizer record by schema ID (custom `id`)
const getYeglizerById = asyncHandler(async (req, res, next) => {
  const yeglizer = await Yeglizer.findOne({ id: req.params.id });
  if (!yeglizer) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json({ status: 'success', data: yeglizer });
});

// Create a new Yeglizer record
const createYeglizer = asyncHandler(async (req, res) => {
  const newYeglizer = await Yeglizer.create(req.body);
  res.status(201).json({ status: 'success', data: newYeglizer });
});

// Update a Yeglizer record by schema ID (custom `id`)
const updateYeglizerById = asyncHandler(async (req, res, next) => {
  const updatedYeglizer = await Yeglizer.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedYeglizer) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json({ status: 'success', data: updatedYeglizer });
});

// Delete a Yeglizer record by schema ID (custom `id`)
const deleteYeglizerById = asyncHandler(async (req, res, next) => {
  const deletedYeglizer = await Yeglizer.findOneAndDelete({
    id: req.params.id,
  });
  if (!deletedYeglizer) {
    throw new AppError('Record not found', 404);
  }

  res.status(204).json({ status: 'success', data: null });
});

module.exports = {
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
};
