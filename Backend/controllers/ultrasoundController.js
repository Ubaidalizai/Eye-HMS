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

// Get a single record by custom schema id
const getRecordById = asyncHandler(async (req, res) => {
  try {
    const record = await Ultrasound.findOne({ id: req.params.id }); // Using schema-defined 'id'
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new record
const addRecord = asyncHandler(async (req, res) => {
  const { id, name, time, date, image, percentage } = req.body;
  try {
    // Check if a record with the same 'id' already exists
    const existingRecord = await Ultrasound.findOne({ id });
    if (existingRecord)
      return res
        .status(400)
        .json({ message: 'Record with this ID already exists' });

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing record by custom schema id
const updateRecord = asyncHandler(async (req, res) => {
  try {
    const updatedRecord = await Ultrasound.findOneAndUpdate(
      { id: req.params.id }, // Use schema 'id' for lookup
      req.body,
      { new: true, runValidators: true } // Ensure validation on update
    );
    if (!updatedRecord)
      return res.status(404).json({ message: 'Record not found' });
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a record by custom schema id
const deleteRecord = asyncHandler(async (req, res) => {
  try {
    const deletedRecord = await Ultrasound.findOneAndDelete({
      id: req.params.id,
    });
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
