// controllers/laboratoryController.js
const Laboratory = require('../models/labratoryModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');

// Create a new lab record
const createLabRecord = asyncHandler(async (req, res) => {
  const labRecord = new Laboratory(req.body);
  await labRecord.save();
  res
    .status(201)
    .json({ message: 'Lab record created successfully', data: labRecord });
});

// Get all lab records
const getAllLabRecords = getAll(Laboratory);

// Get a specific lab record by patientId
const getLabRecordByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labRecord = await Laboratory.findOne({ patientId });
  if (!labRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res
    .status(200)
    .json({ message: 'Lab record retrieved successfully', data: labRecord });
});

// Update a lab record by patientId
const updateLabRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedLabRecord = await Laboratory.findOneAndUpdate({ id }, req.body, {
    new: true,
  });
  if (!updatedLabRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res.status(200).json({
    message: 'Lab record updated successfully',
    data: updatedLabRecord,
  });
});

// Delete a lab record by patientId
const deleteLabRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedLabRecord = await Laboratory.findByIdAndDelete(id);
  if (!deletedLabRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res.status(200).json({ message: 'Lab record deleted successfully' });
});

module.exports = {
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
};
