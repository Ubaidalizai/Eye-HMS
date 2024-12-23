const OPD = require('../models/opdModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');

// Get all OPD records
const getAllRecords = getAll(OPD);
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
  const { patientId, doctorId, date, time, price, discount } = req.body;
  if (!patientId || !doctorId || !date || !time || !price) {
    throw new AppError('All fields are required', 400);
  }

  const newRecord = await OPD.create({
    patientId,
    doctorId,
    date,
    time,
    price,
    discount,
  });
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
