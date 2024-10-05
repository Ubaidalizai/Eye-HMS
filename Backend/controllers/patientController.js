const asyncHandler = require('../middlewares/asyncHandler');
const Patient = require('../models/patientModel');
const getAll = require('../controllers/handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

const getAllPatients = getAll(Patient);

// Add Patient
const addPatient = asyncHandler(async (req, res) => {
  const {
    name,
    age,
    contact,
    patientID,
    patientGender,
    insuranceContact,
  } = req.body;

  if (!name || !age || !contact || !patientID || !patientGender) {
    return res.status(400).json({ message: 'All fields required!' });
  }

  const patientExist = await Patient.findOne({ patientID: patientID });
  if (patientExist) {
    return res.status(409).json({
      message: 'Patient already exist with the requested patient ID!',
    });
  }

  // Create new patient
  const patient = new Patient({
    name,
    age,
    contact,
    patientID,
    patientGender,
    insuranceContact,
    prescriptions: [], // Start with empty prescriptions array
  });

  const createdPatient = await patient.save();

  res.status(201).json({
    message: 'Patient added successfully',
    data: createdPatient,
  });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patientId = req.params.id;
  validateMongoDBId(patientId);

  const {
    name,
    age,
    contact,
    patientID,
    patientGender,
    insuranceContact,
  } = req.body;

  // Find and update patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404).json({ message: 'Patient not found' });
    return;
  }

  patient.name = name || patient.name;
  patient.age = age || patient.age;
  patient.contact = contact || patient.contact;
  patient.patientID = patientID || patient.patientID;
  patient.patientGender = patientGender || patient.patientGender;
  patient.insuranceContact = insuranceContact || patient.insuranceContact;

  const updatedPatient = await patient.save();

  res.status(200).json({
    message: 'Patient updated successfully',
    data: updatedPatient,
  });
});

const deletePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  // Find and delete patient
  const patient = await Patient.findById(id);

  if (!patient) {
    res.status(404).json({ message: 'Patient not found' });
    return;
  }

  await patient.deleteOne();

  res.status(200).json({ message: 'Patient deleted successfully' });
});

module.exports = { getAllPatients, addPatient, updatePatient, deletePatient };
