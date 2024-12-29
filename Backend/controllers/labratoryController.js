// controllers/laboratoryController.js
const Laboratory = require('../models/labratoryModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');

// Create a new lab record
const createLabRecord = asyncHandler(async (req, res) => {
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

  const laboratory = new Laboratory({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    price: req.body.price,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await laboratory.save();

  // Create a new record if it doesn't exist
  await DoctorKhata.create({
    branchNameId: laboratory._id,
    branchModel: 'labratoryModule',
    doctorId: doctorExist._id,
    amount: doctorPercentage,
    date: req.body.date,
    amountType: 'income',
  });

  if (laboratory.totalAmount > 0) {
    await Income.create({
      saleId: laboratory._id,
      saleModel: 'labratoryModule',
      date: laboratory.date,
      totalNetIncome: laboratory.totalAmount,
      category: 'laboratory',
      description: 'Laboratory income',
    });
  }

  res
    .status(201)
    .json({ message: 'Lab record created successfully', data: laboratory });
});

// Get all lab records
const getAllLabRecords = getAll(Laboratory, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get a specific lab record by patientId
const getLabRecordByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labRecord = await Laboratory.findOne({ patientId });
  if (!labRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res
    .status(200)
    .json({ message: 'Lab record retrieved successfully', data: labRecord });
});

// Update a lab record by patientId
const updateLabRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedLabRecord = await Laboratory.findOneAndUpdate({ id }, req.body, {
    new: true,
  });
  if (!updatedLabRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res.status(200).json({
    message: 'Lab record updated successfully',
    data: updatedLabRecord,
  });
});

// Delete a lab record by patientId
const deleteLabRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const deletedLabRecord = await Laboratory.findByIdAndDelete(id);
  if (!deletedLabRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res.status(200).json({ message: 'Lab record deleted successfully' });
});

module.exports = {
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
};
