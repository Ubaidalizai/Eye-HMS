// controllers/ultrasoundController.js
const Ultrasound = require('../models/ultraSoundModule');
const asyncHandler = require('../middlewares/asyncHandler');
// Get all ultrasound records
const getAllRecords = asyncHandler(async (req, res) => {
  try {
    const records = await Ultrasound.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single record by ID
const getRecordById = asyncHandler(async (req, res) => {
  try {
    const record = await Ultrasound.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new record
const addRecord = asyncHandler(async (req, res) => {
  const { id, name, time, date, image } = req.body;
  try {
    const newRecord = new Ultrasound({ id, name, time, date, image });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing record
const updateRecord = asyncHandler(async (req, res) => {
  try {
    const updatedRecord = await Ultrasound.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecord)
      return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a record
const deleteRecord = asyncHandler(async (req, res) => {
  try {
    const deletedRecord = await Ultrasound.findByIdAndDelete(req.params.id);
    if (!deletedRecord)
      return res.status(404).json({ message: 'Record not found' });
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
