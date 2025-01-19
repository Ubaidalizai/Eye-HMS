const mongoose = require('mongoose');
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
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');

const getYeglizerDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Yeglizer);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getYeglizerDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Yeglizer);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

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
const createYeglizer = asyncHandler(async (req, res, next) => {
  const { patientId, doctor } = req.body;

  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Validate patient
    const patient = await Patient.findOne({ patientID: patientId }).session(
      session
    );
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Step 2: Validate doctor
    const doctorExist = await User.findById(doctor).session(session);
    if (!doctorExist || doctorExist.role !== 'doctor') {
      throw new AppError('Doctor not found', 404);
    }

    // Step 3: Calculate total amount and doctor percentage
    req.body.totalAmount = req.body.price;
    let doctorPercentage = 0;

    if (doctorExist.percentage) {
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

    // Step 4: Create Yeglizer record
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

    await newYeglizer.save({ session });

    // Step 5: Add to DoctorKhata
    if (doctorPercentage > 0 && doctorExist.percentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: newYeglizer._id,
            branchModel: 'yeglizerModel',
            doctorId: doctorExist._id,
            amount: doctorPercentage,
            date: req.body.date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    // Step 6: Add to Income
    if (newYeglizer.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: newYeglizer._id,
            saleModel: 'yeglizerModel',
            date: newYeglizer.date,
            totalNetIncome: newYeglizer.totalAmount,
            category: 'yeglizer',
            description: 'Yeglizer income',
          },
        ],
        { session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(201).json({
      status: 'success',
      data: newYeglizer,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
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
const deleteYeglizerById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a MongoDB transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the Yeglizer record
    const yeglizerRecord = await Yeglizer.findById(id).session(session);
    if (!yeglizerRecord) {
      throw new AppError('Record not found', 404);
    }

    // Step 2: Delete the Yeglizer record
    const deletedYeglizer = await Yeglizer.findByIdAndDelete(id, { session });
    if (!deletedYeglizer) {
      throw new AppError('Failed to delete Yeglizer record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: yeglizerRecord._id, branchModel: 'yeglizerModel' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      throw new AppError('Failed to delete related DoctorKhata record', 500);
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: yeglizerRecord._id, saleModel: 'yeglizerModel' },
      { session }
    );

    if (incomeResult.deletedCount === 0) {
      throw new AppError('Failed to delete related Income record', 500);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(204).json({
      status: 'success',
      data: null,
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
  const results = await getPatientRecordsByPatientID(patientID, Yeglizer);

  res.status(200).json({
    success: true,
    data: results,
  });
});

module.exports = {
  getYeglizerDataByMonth,
  getYeglizerDataByYear,
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
  fetchRecordsByPatientId,
};
