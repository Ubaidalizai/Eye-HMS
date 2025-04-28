const asyncHandler = require('../middlewares/asyncHandler');
const OperationType = require('../models/operationTypeModel');

// @desc   Create a new operation type
// @route  POST /api/v1/operation-types
const createOperationType = asyncHandler(async (req, res) => {
  const { name, type, price } = req.body;

  if (!name || !type || !price) {
    throw new Error('all fields are required');
  }

  const existingType = await OperationType.findOne({ name });
  if (existingType) {
    throw new Error('Record already exists');
  }

  const operationType = await OperationType.create({
    name,
    type,
    price,
  });

  res.status(201).json({
    success: true,
    message: 'Record created successfully',
    data: operationType,
  });
});

// @desc   Get all operation types
// @route  GET /api/v1/operation-types
const getAllOperationTypes = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = type ? { type } : {}; // Filter by type if provided

  const operationTypes = await OperationType.find(query).select('-__v'); // Exclude __v field

  res.status(200).json({
    success: true,
    data: operationTypes,
  });
});

// @desc   Get a single operation type by ID
// @route  GET /api/v1/operation-types/:id
const getOperationTypeById = asyncHandler(async (req, res) => {
  const operationType = await OperationType.findById(req.params.id);

  if (!operationType) {
    res.status(404);
    throw new Error('Record not found');
  }

  res.status(200).json({ success: true, data: operationType });
});

// @desc   Update an operation type
// @route  PATCH /api/v1/operation-types/:id
const updateOperationType = asyncHandler(async (req, res) => {
  const { name, type, price } = req.body;

  const operationType = await OperationType.findByIdAndUpdate(
    req.params.id,
    { name, type, price },
    { new: true, runValidators: true }
  );

  if (!operationType) {
    res.status(404);
    throw new Error('Record not found');
  }

  res.status(200).json({
    success: true,
    message: 'Record updated successfully',
    data: operationType,
  });
});

// @desc   Delete an operation type
// @route  DELETE /api/v1/operation-types/:id
const deleteOperationType = asyncHandler(async (req, res) => {
  const operationType = await OperationType.findById(req.params.id);
  if (!operationType) {
    throw new AppError('Operation Type not found', 404);
  }
  await operationType.deleteOne(); // hard delete
  res.status(200).json({ message: 'Operation Type marked as deleted' });
});

module.exports = {
  createOperationType,
  getAllOperationTypes,
  getOperationTypeById,
  updateOperationType,
  deleteOperationType,
};
