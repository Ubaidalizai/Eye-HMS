// controllers/octController.js
const OCT = require('../models/octModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const calculatePercentage = require('../utils/calculatePercentage');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

// Create a new OCT record
const createOCTRecord = asyncHandler(async (req, res) => {
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

  const octRecord = new OCT({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    price: req.body.price,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await octRecord.save();

  // Create a new record if it doesn't exist
  await DoctorKhata.create({
    branchNameId: octRecord._id,
    branchModel: 'octModule',
    doctorId: doctorExist._id,
    amount: doctorPercentage,
    date: req.body.date,
    amountType: 'income',
  });

  if (octRecord.totalAmount > 0) {
    await Income.create({
      saleId: octRecord._id,
      saleModel: 'octModule',
      date: octRecord.date,
      totalNetIncome: octRecord.totalAmount,
      category: 'oct',
      description: 'OCT income',
    });
  }

  res
    .status(201)
    .json({ message: 'OCT record created successfully', data: octRecord });
});

// Get all OCT records
const getAllOCTRecords = getAll(OCT, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get an OCT record by ID
const getOCTRecordById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const octRecord = await OCT.findOne({ patientId });
  if (!octRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res
    .status(200)
    .json({ message: 'OCT record retrieved successfully', data: octRecord });
});

// Update an OCT record by ID
const updateOCTRecordById = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const updatedOCTRecord = await OCT.findOneAndUpdate({ patientId }, req.body, {
    new: true,
  });
  if (!updatedOCTRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res.status(200).json({
    message: 'OCT record updated successfully',
    data: updatedOCTRecord,
  });
});

// Delete an OCT record by ID
const deleteOCTRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedOCTRecord = await OCT.findByIdAndDelete(id);
  if (!deletedOCTRecord) {
    throw new AppError('OCT record not found', 404);
  }
  res.status(200).json({ message: 'OCT record deleted successfully' });
});

module.exports = {
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
};
