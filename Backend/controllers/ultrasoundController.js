// controllers/ultrasoundController.js
const Ultrasound = require('../models/ultraSoundModule');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');

// Get all ultrasound records
const getAllRecords = getAll(Ultrasound);

// Get a single record by custom schema id
const getRecordById = asyncHandler(async (req, res, next) => {
  const record = await Ultrasound.findOne({ id: req.params.id }); // Using schema-defined 'id'
  if (!record) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json(record);
});

// Add a new record
const addRecord = asyncHandler(async (req, res, next) => {
  const { id, name, time, date, image, percentage } = req.body;

  // Check if a record with the same 'id' already exists
  const existingRecord = await Ultrasound.findOne({ id });
  if (existingRecord) {
    throw new AppError('Record with this ID already exists', 400);
  }

  const newRecord = new Ultrasound({
    id,
    name,
    time,
    date,
    image,
    percentage,
  });
  await newRecord.save();
  res.status(201).json(newRecord);
});

// Update an existing record by custom schema id
// Update an existing record by custom schema id
const updateRecord = asyncHandler(async (req, res, next) => {
  const updatedRecord = await Ultrasound.findOneAndUpdate(
    { id: req.params.id }, // Use schema 'id' for lookup
    req.body,
    { new: true, runValidators: true } // Ensure validation on update
  );

  if (!updatedRecord) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json(updatedRecord);
});

// Delete a record by custom schema id
const deleteRecord = asyncHandler(async (req, res, next) => {
  const deletedRecord = await Ultrasound.findOneAndDelete({
    id: req.params.id,
  });

  if (!deletedRecord) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json({ message: 'Record deleted successfully' });
});

module.exports = {
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
