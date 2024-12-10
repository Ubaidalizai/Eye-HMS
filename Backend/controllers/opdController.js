const OPD = require('../models/opdModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

// Get all OPD records
const getAllRecords = asyncHandler(async (req, res, next) => {
  const records = await OPD.find();
  res.status(200).json(records);
});

// Get a specific OPD record by patientId
const getRecordByPatientId = asyncHandler(async (req, res, next) => {
  const record = await OPD.findOne({ patientId: req.params.patientId });
  if (!record) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json(record);
});

// Add a new OPD record
const addRecord = asyncHandler(async (req, res, next) => {
  const { patientId } = req.body;
  const existingRecord = await OPD.findOne({ patientId });
  if (existingRecord) {
    throw new AppError('Record with this patientId already exists', 400);
  }
  const newRecord = await OPD.create(req.body);
  res.status(201).json(newRecord);
});

// Update an existing OPD record by patientId
const updateRecordByPatientId = asyncHandler(async (req, res, next) => {
  const updatedRecord = await OPD.findOneAndUpdate(
    { patientId: req.params.patientId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedRecord) {
    return next(new AppError('Record not found', 404));
  }
  res.status(200).json(updatedRecord);
});

// Delete an OPD record by patientId
const deleteRecordByPatientId = asyncHandler(async (req, res, next) => {
  const deletedRecord = await OPD.findOneAndDelete({
    patientId: req.params.patientId,
  });
  if (!deletedRecord) {
    return next(new AppError('Record not found', 404));
  }
  res.status(204).json();
});
module.exports = {
  getAllRecords,
  getRecordByPatientId,
  addRecord,
  updateRecordByPatientId,
  deleteRecordByPatientId,
};
