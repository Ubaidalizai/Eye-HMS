// controllers/laboratoryController.js
const Laboratory = require('../models/labratoryModule');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');

// Create a new lab record
const createLabRecord = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.body;
    const existingRecord = await Laboratory.findOne({ patientId });
    if (existingRecord) {
      return res
        .status(400)
        .json({ message: 'Record with this patientId already exists' });
    }

    const labRecord = new Laboratory(req.body);
    await labRecord.save();
    res
      .status(201)
      .json({ message: 'Lab record created successfully', data: labRecord });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to create lab record', error: error.message });
  }
});

// Get all lab records
const getAllLabRecords = getAll(Laboratory);

// Get a specific lab record by patientId
const getLabRecordByPatientId = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.params;
    const labRecord = await Laboratory.findOne({ patientId });
    if (!labRecord) {
      return res.status(404).json({ message: 'Lab record not found' });
    }
    res
      .status(200)
      .json({ message: 'Lab record retrieved successfully', data: labRecord });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to retrieve lab record', error: error.message });
  }
});

// Update a lab record by patientId
const updateLabRecordByPatientId = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.params;
    const updatedLabRecord = await Laboratory.findOneAndUpdate(
      { patientId },
      req.body,
      { new: true }
    );
    if (!updatedLabRecord) {
      return res.status(404).json({ message: 'Lab record not found' });
    }
    res.status(200).json({
      message: 'Lab record updated successfully',
      data: updatedLabRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update lab record', error: error.message });
  }
});

// Delete a lab record by patientId
const deleteLabRecordByPatientId = asyncHandler(async (req, res) => {
  try {
    const { patientId } = req.params;
    const deletedLabRecord = await Laboratory.findOneAndDelete({ patientId });
    if (!deletedLabRecord) {
      return res.status(404).json({ message: 'Lab record not found' });
    }
    res.status(200).json({ message: 'Lab record deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete lab record', error: error.message });
  }
});

module.exports = {
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordByPatientId,
  deleteLabRecordByPatientId,
};
