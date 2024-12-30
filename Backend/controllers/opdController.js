const OPD = require('../models/opdModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');

const getOpdDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, OPD);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getOpdDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, OPD);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Get all OPD records
const getAllRecords = getAll(OPD, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get a specific OPD record by patientId
const getRecordByPatientId = asyncHandler(async (req, res, next) => {
  const record = await OPD.findOne({ patientId: req.params.patientId });
  if (!record) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json(record);
});

// Add a new OPD record
const addRecord = asyncHandler(async (req, res) => {
  const { patientId, doctor } = req.body;

  const patient = await Patient.findOne({ patientID: patientId });
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const doctorExist = await User.findById(doctor);
  if (!doctorExist || doctorExist.role !== 'doctor') {
    throw new AppError('Doctor not found', 404);
  }

  req.body.totalAmount = req.body.price;
  let doctorPercentage = 0;

  if (doctorExist.percentage) {
    // Calculate percentage and update total amount
    const result = await calculatePercentage(
      req.body.price,
      doctorExist.percentage
    );
    req.body.totalAmount = result.finalPrice;
    doctorPercentage = result.percentageAmount;
  }

  if (req.body.discount > 0) {
    const result = await calculatePercentage(
      req.body.totalAmount,
      req.body.discount
    );
    req.body.totalAmount = result.finalPrice;
  }

  const opdRecord = new OPD({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    price: req.body.price,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await opdRecord.save();

  // Create a new record if it doesn't exist
  await DoctorKhata.create({
    branchNameId: opdRecord._id,
    branchModel: 'opdModule',
    doctorId: doctorExist._id,
    amount: doctorPercentage,
    date: req.body.date,
    amountType: 'income',
  });

  if (opdRecord.totalAmount > 0) {
    await Income.create({
      saleId: opdRecord._id,
      saleModel: 'opdModule',
      date: opdRecord.date,
      totalNetIncome: opdRecord.totalAmount,
      category: 'opd',
      description: 'OPD income',
    });
  }

  res.status(201).json(opdRecord);
});

// Update an existing OPD record by patientId
const updateRecordByPatientId = asyncHandler(async (req, res, next) => {
  const updatedRecord = await OPD.findOneAndUpdate(
    { patientId: req.params.patientId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedRecord) {
    return next(new AppError('Record not found', 404));
  }
  res.status(200).json(updatedRecord);
});

// Delete an OPD record by patientId
const deleteRecordByPatientId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedRecord = await OPD.findByIdAndDelete(id);
  if (!deletedRecord) {
    return next(new AppError('Record not found', 404));
  }
  res.status(204).json();
});

module.exports = {
  getOpdDataByYear,
  getOpdDataByMonth,
  getAllRecords,
  getRecordByPatientId,
  addRecord,
  updateRecordByPatientId,
  deleteRecordByPatientId,
};
