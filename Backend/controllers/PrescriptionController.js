// controllers/PrescriptionController.js

const Prescription = require('../models/PrescriptionModule');
const Patient = require('../models/patientModel');
// Create a new prescription
const createPrescription = async (req, res) => {
  try {
    const { patient_Id } = req.params; // Extract patient_Id from the URL

    // Create a new prescription and associate it with the patient
    const newPrescription = new Prescription({
      ...req.body,
      patient_Id, // Associate the prescription with the patient
    });

    // Save the new prescription
    const savedPrescription = await newPrescription.save();

    // Find the patient by patient_Id
    const patient = await Patient.findById(patient_Id); // Assuming you have a Patient model

    if (!patient) {
      return res.status(404).json({
        message: 'Patient not found',
      });
    }

    // Add the new prescription's ID to the patient's prescriptions array
    patient.prescriptions.push(savedPrescription._id); // Assuming prescriptions is an array in the Patient model

    // Save the updated patient record
    await patient.save();

    return res.status(201).json({
      message: 'Prescription created successfully and added to patient record',
      data: savedPrescription,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Error creating prescription or updating patient record',
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

    // Update the corresponding patient record if needed
    const patient = await Patient.findOneAndUpdate(
      { prescriptions: prescriptionId }, // Find patient with this prescription
      { $set: { 'prescriptions.$': updatedPrescription._id } }, // Update the prescription ID in patient
      { new: true } // Return the updated patient document
    );

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

    // Find the prescription first
    const deletedPrescription = await Prescription.findByIdAndDelete(
      prescriptionId
    );

    if (!deletedPrescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    // Remove the prescription ID from the patient's prescriptions array
    const patient = await Patient.findOneAndUpdate(
      { prescriptions: prescriptionId }, // Find patient with this prescription
      { $pull: { prescriptions: prescriptionId } }, // Remove prescription ID from patient's prescriptions array
      { new: true } // Return the updated patient document
    );

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
