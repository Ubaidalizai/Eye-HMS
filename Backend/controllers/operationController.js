const Operation = require('../models/operationModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');
const calculatePercentage = require('../utils/calculatePercentage');

// Create a new operation
const createOperation = asyncHandler(async (req, res) => {
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

  if (doctorExist.percentage) {
    // Calculate percentage and update total amount
    const result = await calculatePercentage(
      req.body.price,
      doctorExist.percentage
    );
    req.body.totalAmount = result.finalPrice;

    // Create a new record if it doesn't exist
    await DoctorKhata.create({
      doctorId: doctorExist._id,
      amount: result.percentageAmount,
      date: req.body.date,
      amountType: 'income',
    });
  }

  if (req.body.discount > 0) {
    const result = await calculatePercentage(
      req.body.totalAmount,
      req.body.discount
    );
    req.body.totalAmount = result.finalPrice;
  }

  const operation = new Operation({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    price: req.body.price,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await operation.save();

  res
    .status(201)
    .json({ message: 'Operation created successfully', operation });
});

// Get all operations
const getAllOperations = getAll(Operation, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

const updateOperation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const operation = await Operation.findOneAndUpdate({ id: id }, req.body, {
    new: true, // Return the updated operation
  });

  if (!operation) {
    throw new AppError('Operation not found', 404);
  }

  res.status(200).json({
    message: 'Operation updated successfully',
    operation,
  });
});

// Delete an operation by ID
const deleteOperation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const operation = await Operation.findByIdAndDelete(id);

  if (!operation) {
    throw new AppError('Operation not found', 404);
  }

  res.status(200).json({ message: 'Operation deleted successfully' });
});

module.exports = {
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
};
