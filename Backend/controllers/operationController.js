const Operation = require('../models/operationModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');

// Create a new operation
const createOperation = asyncHandler(async (req, res, next) => {
  const operation = new Operation(req.body);
  await operation.save();
  res
    .status(201)
    .json({ message: 'Operation created successfully', operation });
});

// Get all operations
const getAllOperations = getAll(Operation);

const updateOperation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const operation = await Operation.findOneAndUpdate({ id: id }, req.body, {
    new: true, // Return the updated operation
  });

  if (!operation) {
    throw new AppError('Operation not found', 404);
  }

  res.status(200).json({
    message: 'Operation updated successfully',
    operation,
  });
});

// Delete an operation by ID
const deleteOperation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const operation = await Operation.findOneAndDelete({ id: id }); // Find by custom ID

  if (!operation) {
    throw new AppError('Operation not found', 404);
  }

  res.status(200).json({ message: 'Operation deleted successfully' });
});

module.exports = {
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
};
