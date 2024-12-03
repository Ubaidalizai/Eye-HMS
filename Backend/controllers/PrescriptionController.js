// controllers/PrescriptionController.js

const Prescription = require('../models/PrescriptionModule');
const Patient = require('../models/patientModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

// Create a new prescription
const createPrescription = asyncHandler(async (req, res) => {
  const { patientName } = req.params; // Extract patientName from the URL

  // Find the patient by name
  const patient = await Patient.findOne({ name: patientName }); // Assuming 'name' is a field in the Patient model

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  // Create a new prescription and associate it with the patient
  const newPrescription = new Prescription({
    ...req.body,
    patient_Id: patient._id, // Use the found patient's ID
  });

  // Save the new prescription
  const savedPrescription = await newPrescription.save();

  // Add the new prescription's ID to the patient's prescriptions array
  patient.prescriptions.push(savedPrescription._id); // Assuming prescriptions is an array in the Patient model

  // Save the updated patient record
  await patient.save();

  res.status(201).json({
    message: 'Prescription created successfully and added to patient record',
    data: savedPrescription,
  });
});

// Get a single prescription by ID
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescriptionId = req.params.id;
  const prescription = await Prescription.findById(prescriptionId);

  if (!prescription) {
    throw new AppError('Prescription not found', 404);
  }

  res.status(200).json({
    message: 'Prescription fetched successfully',
    data: prescription,
  });
});

const getPrescriptionsByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  console.log(patientId);
  const patient = await Patient.findById(patientId).populate('prescriptions');

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  res.status(200).json({
    message: 'Prescriptions fetched successfully',
    data: patient.prescriptions,
  });
});

const getPrescriptionsByPatientName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  console.log('Patient Name:', name);

  const patient = await Patient.findOne({ name }).populate('prescriptions');

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  res.status(200).json({
    message: 'Prescriptions fetched successfully',
    data: patient.prescriptions,
  });
});

// Get all prescriptions
const getAllPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find();
  res.status(200).json({
    message: 'All prescriptions fetched successfully',
    data: prescriptions,
  });
});

const updatePrescription = asyncHandler(async (req, res, next) => {
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
    throw new AppError('Prescription not found', 404);
  }

  // Update the corresponding patient record if needed
  await Patient.findOneAndUpdate(
    { prescriptions: prescriptionId }, // Find patient with this prescription
    { $set: { 'prescriptions.$': updatedPrescription._id } }, // Update the prescription ID in patient
    { new: true } // Return the updated patient document
  );

  res.status(200).json({
    message: 'Prescription updated successfully',
    data: updatedPrescription,
  });
});

const deletePrescription = asyncHandler(async (req, res, next) => {
  const prescriptionId = req.params.id;

  // Find the prescription first
  const deletedPrescription = await Prescription.findByIdAndDelete(
    prescriptionId
  );

  if (!deletedPrescription) {
    throw new AppError('Prescription not found', 404);
  }

  // Remove the prescription ID from the patient's prescriptions array
  await Patient.findOneAndUpdate(
    { prescriptions: prescriptionId }, // Find patient with this prescription
    { $pull: { prescriptions: prescriptionId } }, // Remove prescription ID from patient's prescriptions array
    { new: true } // Return the updated patient document
  );

  return res.status(200).json({
    message: 'Prescription deleted successfully',
    data: deletedPrescription,
  });
});

module.exports = {
  createPrescription,
  getPrescriptionById,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatientId,
  getPrescriptionsByPatientName,
};
