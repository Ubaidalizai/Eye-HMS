const asyncHandler = require('../middlewares/asyncHandler');
const OperationType = require('../models/operationTypeModel');

// @desc   Create a new operation type
// @route  POST /api/v1/operation-types
const createOperationType = asyncHandler(async (req, res) => {
  const { name, type, price } = req.body;

  if (!name || !type || !price) {
    throw new Error('all fields are required');
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
  const { type, search, page, limit, all } = req.query;

  // Build query object
  const query = { isDeleted: { $ne: true } }; // Exclude deleted records

  // Add type filter if specified
  if (type) {
    query.type = type;
  }

  // Add search filter if specified (case-insensitive search by name)
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  // If 'all' parameter is provided, return all records without pagination
  if (all === 'true') {
    const operationTypes = await OperationType.find(query)
      .select('-__v')
      .sort({ name: 1 }); // Sort by name for dropdowns

    return res.status(200).json({
      success: true,
      results: operationTypes.length,
      data: operationTypes,
    });
  }

  // Default paginated response
  const pageNumber = parseInt(page) || 1;
  const limitNumber = parseInt(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const [operationTypes, totalDocs] = await Promise.all([
    OperationType.find(query)
      .select('-__v')
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber),
    OperationType.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalDocs / limitNumber);

  res.status(200).json({
    success: true,
    currentPage: pageNumber,
    totalPages,
    results: totalDocs,
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
