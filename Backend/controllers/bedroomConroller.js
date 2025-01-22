const Bedroom = require('../models/bedroomModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');
const calculatePercentage = require('../utils/calculatePercentage');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');

const getBedroomDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Bedroom);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getBedroomDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Bedroom);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new bedroom
const createBedroom = asyncHandler(async (req, res) => {
  const { patientId, doctor } = req.body;

  const patient = await Patient.findOne({ patientID: patientId });
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  const doctorExist = await User.findById(doctor);
  if (!doctorExist || doctorExist.role !== 'doctor') {
    throw new AppError('Doctor not found', 404);
  }

  req.body.totalAmount = req.body.rent;
  let doctorPercentage = 0;

  if (doctorExist.percentage > 0) {
    // Calculate percentage and update total amount
    const result = await calculatePercentage(
      req.body.rent,
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

  // Create a new record if it doesn't exist
  if (doctorPercentage > 0 && doctorExist.percentage > 0) {
    await DoctorKhata.create({
      branchNameId: bedroom._id,
      branchModel: 'bedroomModule',
      doctorId: doctorExist._id,
      amount: doctorPercentage,
      date: req.body.date,
      amountType: 'income',
    });
  }
  if (bedroom.totalAmount > 0) {
    await Income.create({
      saleId: bedroom._id,
      saleModel: 'bedroomModule',
      date: bedroom.date,
      totalNetIncome: bedroom.totalAmount,
      category: 'bedroom',
      description: 'Bedroom income',
    });
  }

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

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the bedroom record
    const bedroom = await Bedroom.findById(id).session(session);
    if (!bedroom) {
      throw new AppError('Bedroom not found', 404);
    }

    // Step 2: Delete the bedroom record
    const deletedBedroom = await Bedroom.findByIdAndDelete(id, { session });
    if (!deletedBedroom) {
      throw new AppError('Failed to delete bedroom record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: bedroom._id, branchModel: 'bedroomModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      const doctorKhataExists = await DoctorKhata.findOne({
        branchNameId: bedroom._id,
        branchModel: 'bedroomModule',
      }).session(session);

      if (doctorKhataExists) {
        throw new AppError('Failed to delete related doctor khata record', 500);
      }
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: bedroom._id, saleModel: 'bedroomModule' },
      { session }
    );

    if (incomeResult.deletedCount === 0) {
      const incomeExists = await Income.findOne({
        saleId: bedroom._id,
        saleModel: 'bedroomModule',
      }).session(session);

      if (incomeExists) {
        throw new AppError('Failed to delete related income record', 500);
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Bedroom and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  const patientID = req.params.patientID;
  const results = await getPatientRecordsByPatientID(patientID, Bedroom);

  res.status(200).json({
    success: true,
    data: results,
  });
});

module.exports = {
  getBedroomDataByYear,
  getBedroomDataByMonth,
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
  fetchRecordsByPatientId,
};
