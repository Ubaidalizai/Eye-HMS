const Bedroom = require('../models/bedroomModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');
const calculatePercentage = require('../utils/calculatePercentage');

// Create a new bedroom
const createBedroom = asyncHandler(async (req, res) => {
  const { patientId, doctor } = req.body;
  console.log(patientId, doctor);

  const patient = await Patient.findOne({ patientID: patientId });
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const doctorExist = await User.findById(doctor);
  if (!doctorExist || doctorExist.role !== 'doctor') {
    throw new AppError('Doctor not found', 404);
  }

  req.body.totalAmount = req.body.rent;

  if (doctorExist.percentage) {
    // Calculate percentage and update total amount
    const result = await calculatePercentage(
      req.body.rent,
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

  const bedroom = new Bedroom({
    patientId: patient._id,
    doctor: doctor,
    percentage: doctorExist.percentage,
    rent: req.body.rent,
    time: req.body.time,
    date: req.body.date,
    discount: req.body.discount,
    totalAmount: req.body.totalAmount,
  });
  await bedroom.save();

  res.status(201).json({
    success: true,
    message: 'Bedroom created successfully',
    data: bedroom,
  });
});

// Get all bedrooms
const getAllBedrooms = getAll(Bedroom, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get a bedroom by schema `id`
const getBedroomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOne({ id }); // Find by schema-defined `id`

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom retrieved successfully',
    data: bedroom,
  });
});

// Update a bedroom by schema `id`
const updateBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOneAndUpdate({ id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom updated successfully',
    data: bedroom,
  });
});

// Delete a bedroom by schema `id`
const deleteBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOneAndDelete({ id });

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom deleted successfully',
  });
});

module.exports = {
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
};
