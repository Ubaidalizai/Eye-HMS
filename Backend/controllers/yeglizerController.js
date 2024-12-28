const Yeglizer = require('../models/yeglizerModel');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');

// Get all Yeglizer records
const getAllYeglizers = getAll(Yeglizer, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get a single Yeglizer record by schema ID (custom `id`)
const getYeglizerById = asyncHandler(async (req, res) => {
  const yeglizer = await Yeglizer.findOne({ id: req.params.id });
  if (!yeglizer) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json({ status: 'success', data: yeglizer });
});

// Create a new Yeglizer record
const createYeglizer = asyncHandler(async (req, res) => {
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

  const newYeglizer = new Yeglizer({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    price: req.body.price,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await newYeglizer.save();

  if (newYeglizer.totalAmount > 0) {
    await Income.create({
      saleId: newYeglizer._id,
      saleModel: 'yeglizerModel',
      date: newYeglizer.date,
      totalNetIncome: newYeglizer.totalAmount,
      category: 'yeglizer',
      description: 'yeglaser income',
    });
  }

  res.status(201).json({ status: 'success', data: newYeglizer });
});

// Update a Yeglizer record by schema ID (custom `id`)
const updateYeglizerById = asyncHandler(async (req, res) => {
  validateMongoDBId(req.params.id);

  const updatedYeglizer = await Yeglizer.findOneAndUpdate(
    { id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedYeglizer) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json({ status: 'success', data: updatedYeglizer });
});

// Delete a Yeglizer record by schema ID (custom `id`)
const deleteYeglizerById = asyncHandler(async (req, res) => {
  validateMongoDBId(req.params.id);

  const deletedYeglizer = await Yeglizer.findOneAndDelete({
    id: req.params.id,
  });
  if (!deletedYeglizer) {
    throw new AppError('Record not found', 404);
  }

  res.status(204).json({ status: 'success', data: null });
});

module.exports = {
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
};
