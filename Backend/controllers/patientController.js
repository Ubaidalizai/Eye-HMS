const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const Patient = require('../models/patientModel');
const getAll = require('../controllers/handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

const {
  getDateRangeForYear,
  getDateRangeForMonth,
} = require('../utils/dateUtils');
const {
  getAggregatedData,
  populateDataArray,
} = require('../utils/aggregationUtils');

// Get summarized data by month for a given year (generic for any model)
const getDataByYear = asyncHandler(async (req, res, Model) => {
  const { year } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForYear(year);
  const matchCriteria = { date: { $gte: startDate, $lte: endDate } };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { month: { $month: '$date' } },
    totalAmount: { $sum: 1 },
  };

  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  const totalAmountsByMonth = populateDataArray(data, 12, 'month');
  res.status(200).json({ data: totalAmountsByMonth });
});

// Get summarized data by day for a given month (generic for any model)
const getDataByMonth = asyncHandler(async (req, res, Model) => {
  const { year, month } = req.params;
  const { category } = req.query;

  const { startDate, endDate } = getDateRangeForMonth(year, month);
  const matchCriteria = { date: { $gte: startDate, $lte: endDate } };
  if (category) matchCriteria.category = category;

  const groupBy = {
    _id: { day: { $dayOfMonth: '$date' } },
    totalAmount: { $sum: 1 },
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const data = await getAggregatedData(Model, matchCriteria, groupBy);

  const totalAmountsByDay = populateDataArray(data, daysInMonth, 'day');
  res.status(200).json({ data: totalAmountsByDay });
});

// Example usage for expenses
const getPatientsByYear = (req, res) => getDataByYear(req, res, Patient);
const getPatientsByMonth = (req, res) => getDataByMonth(req, res, Patient);

const getAllPatients = getAll(Patient);

const addPatient = asyncHandler(async (req, res) => {
  const {
    name,
    age,
    contact,
    patientID,
    patientGender,
    date,
    insuranceContact,
  } = req.body;

  if (!name || !age || !contact || !patientID || !patientGender || !date) {
    throw new AppError('All fields required!', 400);
  }

  const patientExist = await Patient.findOne({ patientID: patientID });
  if (patientExist) {
    throw new AppError(
      'Patient already exist with the requested patient ID!',
      409
    );
  }

  // Create new patient
  const patient = new Patient({
    name,
    age,
    contact,
    patientID,
    patientGender,
    date,
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
    date,
    insuranceContact,
  } = req.body;

  // Find and update patient
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  patient.name = name || patient.name;
  patient.age = age || patient.age;
  patient.contact = contact || patient.contact;
  patient.patientID = patientID || patient.patientID;
  patient.patientGender = patientGender || patient.patientGender;
  patient.date = date || patient.date;
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
    throw new AppError('Patient not found', 404);
  }

  await patient.deleteOne();

  res.status(200).json({ message: 'Patient deleted successfully' });
});

module.exports = {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientsByYear,
  getPatientsByMonth,
};
