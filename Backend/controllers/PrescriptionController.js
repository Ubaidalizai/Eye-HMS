// controllers/PrescriptionController.js

const Prescription = require('../models/PrescriptionModule');

// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const newPrescription = new Prescription(req.body);
    const savedPrescription = await newPrescription.save();
    return res.status(201).json({
      message: 'Prescription created successfully',
      data: savedPrescription,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error creating prescription',
      error: error.message,
    });
  }
};

// Get a single prescription by ID
const getPrescriptionById = async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    return res.status(200).json({
      message: 'Prescription fetched successfully',
      data: prescription,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching prescription',
      error: error.message,
    });
  }
};

// Get all prescriptions
const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find();
    return res.status(200).json({
      message: 'All prescriptions fetched successfully',
      data: prescriptions,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching prescriptions',
      error: error.message,
    });
  }
};

// Update a prescription by ID
const updatePrescription = async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const updateData = req.body;

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      updateData,
      {
        new: true, // Return the updated document
        runValidators: true, // Ensure the update follows schema validation
      }
    );

    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    return res.status(200).json({
      message: 'Prescription updated successfully',
      data: updatedPrescription,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error updating prescription',
      error: error.message,
    });
  }
};

// Delete a prescription by ID
const deletePrescription = async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const deletedPrescription = await Prescription.findByIdAndDelete(
      prescriptionId
    );

    if (!deletedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    return res.status(200).json({
      message: 'Prescription deleted successfully',
      data: deletedPrescription,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting prescription',
      error: error.message,
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptionById,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
