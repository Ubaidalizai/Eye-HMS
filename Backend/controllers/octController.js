// controllers/octController.js
const OCT = require('../models/octModule');
const getAll = require('./handleFactory');

// Create a new OCT record
const createOCTRecord = async (req, res) => {
  try {
    const octRecord = new OCT(req.body);
    await octRecord.save();
    res
      .status(201)
      .json({ message: 'OCT record created successfully', data: octRecord });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to create OCT record', error: error.message });
  }
};

// Get all OCT records
const getAllOCTRecords = getAll(OCT);

// Get an OCT record by ID
const getOCTRecordById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const octRecord = await OCT.findOne(patientId);
    if (!octRecord) {
      return res.status(404).json({ message: 'OCT record not found' });
    }
    res
      .status(200)
      .json({ message: 'OCT record retrieved successfully', data: octRecord });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to retrieve OCT record', error: error.message });
  }
};

// Update an OCT record by ID
const updateOCTRecordById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updatedOCTRecord = await OCT.findOneAndUpdate(patientId, req.body, {
      new: true,
    });
    if (!updatedOCTRecord) {
      return res.status(404).json({ message: 'OCT record not found' });
    }
    res.status(200).json({
      message: 'OCT record updated successfully',
      data: updatedOCTRecord,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to update OCT record', error: error.message });
  }
};

// Delete an OCT record by ID
const deleteOCTRecordById = async (req, res) => {
  try {
    const { patientId } = req.params;
    const deletedOCTRecord = await OCT.findOneAndDelete(patientId);
    if (!deletedOCTRecord) {
      return res.status(404).json({ message: 'OCT record not found' });
    }
    res.status(200).json({ message: 'OCT record deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to delete OCT record', error: error.message });
  }
};

module.exports = {
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
};
