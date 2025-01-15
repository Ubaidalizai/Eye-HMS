// controllers/octController.js
const mongoose = require('mongoose');
const OCT = require('../models/octModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const calculatePercentage = require('../utils/calculatePercentage');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');

const getOctDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, OCT);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getOctDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, OCT);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new OCT record
const createOCTRecord = asyncHandler(async (req, res, next) => {
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

    // Step 4: Create OCT record
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

    await octRecord.save({ session });

    // Step 5: Add to DoctorKhata
    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: octRecord._id,
            branchModel: 'octModule',
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
    if (octRecord.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: octRecord._id,
            saleModel: 'octModule',
            date: octRecord.date,
            totalNetIncome: octRecord.totalAmount,
            category: 'oct',
            description: 'OCT income',
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
      message: 'OCT record created successfully',
      data: octRecord,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
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
const deleteOCTRecordById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the OCT record
    const octRecord = await OCT.findById(id).session(session);
    if (!octRecord) {
      throw new AppError('OCT record not found', 404);
    }

    // Step 2: Delete the OCT record
    const deletedOCTRecord = await OCT.findByIdAndDelete(id, { session });
    if (!deletedOCTRecord) {
      throw new AppError('Failed to delete OCT record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: octRecord._id, branchModel: 'octModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      throw new AppError('Failed to delete related DoctorKhata record', 500);
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: octRecord._id, saleModel: 'octModule' },
      { session }
    );

    if (incomeResult.deletedCount === 0) {
      throw new AppError('Failed to delete related Income record', 500);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(200).json({
      success: true,
      message: 'OCT record and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

module.exports = {
  getOctDataByYear,
  getOctDataByMonth,
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
};
