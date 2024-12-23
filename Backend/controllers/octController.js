// controllers/octController.js
const OCT = require('../models/octModule');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

// Create a new OCT record
const createOCTRecord = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, time, price, discount } = req.body;
  if (!patientId || !doctorId || !date || !time || !price) {
    throw new AppError('Missing required fields', 400);
  }

  const octRecord = new OCT({
    patientId,
    doctorId,
    date,
    time,
    price,
    discount,
  });
  await octRecord.save();
  res
    .status(201)
    .json({ message: 'OCT record created successfully', data: octRecord });
});

// Get all OCT records
const getAllOCTRecords = getAll(OCT);

// Get an OCT record by ID
const getOCTRecordById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const octRecord = await OCT.findOne({ patientId });
  if (!octRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res
    .status(200)
    .json({ message: 'OCT record retrieved successfully', data: octRecord });
});

// Update an OCT record by ID
const updateOCTRecordById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const updatedOCTRecord = await OCT.findOneAndUpdate({ patientId }, req.body, {
    new: true,
  });
  if (!updatedOCTRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res.status(200).json({
    message: 'OCT record updated successfully',
    data: updatedOCTRecord,
  });
});

// Delete an OCT record by ID
const deleteOCTRecordById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const deletedOCTRecord = await OCT.findOneAndDelete({ patientId });
  if (!deletedOCTRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res.status(200).json({ message: 'OCT record deleted successfully' });
});

module.exports = {
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
};
