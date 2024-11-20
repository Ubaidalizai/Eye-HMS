const Operation = require('../models/operationModule');
const asyncHandler = require('../middlewares/asyncHandler');

// Create a new operation
const createOperation = asyncHandler(async (req, res) => {
  try {
    const operation = new Operation(req.body);
    await operation.save();
    res
      .status(201)
      .json({ message: 'Operation created successfully', operation });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create operation', error });
  }
});

// Get all operations
const getAllOperations = asyncHandler(async (req, res) => {
  try {
    const operations = await Operation.find();
    res.status(200).json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve operations', error });
  }
});

// Update an operation by ID
// const updateOperation = asyncHandler(async (req, res) => {
//   try {
//     const { id } = req.params;
//     const operation = await Operation.findByIdAndUpdate(id, req.body, {
//       new: true,
//     });
//     if (!operation) {
//       return res.status(404).json({ message: 'Operation not found' });
//     }
//     res
//       .status(200)
//       .json({ message: 'Operation updated successfully', operation });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to update operation', error });
//   }
// });

const updateOperation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    // Update the operation by the custom 'id' field
    const operation = await Operation.findOneAndUpdate({ id: id }, req.body, {
      new: true, // Return the updated operation
    });

    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }

    res.status(200).json({
      message: 'Operation updated successfully',
      operation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update operation', error });
  }
});

// Delete an operation by ID
const deleteOperation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await Operation.findOneAndDelete({ id: id }); // Find by custom ID
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    res.status(200).json({ message: 'Operation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete operation', error });
  }
});

module.exports = {
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
};
