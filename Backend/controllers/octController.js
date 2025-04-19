// controllers/octController.js
const mongoose = require('mongoose');
const OCT = require('../models/octModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const calculatePercentage = require('../utils/calculatePercentage');
const getAll = require('./handleFactory');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');
const getDoctorsByBranch = require('../utils/getDoctorsByBranch');
const operationTypeModel = require('../models/operationTypeModel');

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
  const { patientId, type } = req.body;

  if (!patientId || !type) {
    throw new AppError('Patient ID and Type are required', 400);
  }

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

    const typeExist = await operationTypeModel.findById(type).session(session);
    if (!typeExist) {
      throw new AppError('Type not found', 404);
    }

    // Step 4: Calculate total amount
    req.body.totalAmount = typeExist.price;

    if (req.body.discount > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        req.body.discount
      );
      req.body.totalAmount = result.finalPrice;
    }

    // Step 5: Create OCT record
    const octRecord = new OCT({
      patientId: patient._id,
      type,
      price: typeExist.price,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await octRecord.save({ session });

    // Step 7: Add to Income
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
      success: true,
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
    path: 'type',
    select: 'name',
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

    // Only throw an error if DoctorKhata record exists but fails to delete
    if (doctorKhataResult.deletedCount === 0) {
      const doctorKhataExists = await DoctorKhata.findOne({
        branchNameId: octRecord._id,
        branchModel: 'octModule',
      }).session(session);

      if (doctorKhataExists) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: octRecord._id, saleModel: 'octModule' },
      { session }
    );

    // Only throw an error if Income record exists but fails to delete
    if (incomeResult.deletedCount === 0) {
      const incomeExists = await Income.findOne({
        saleId: octRecord._id,
        saleModel: 'octModule',
      }).session(session);

      if (incomeExists) {
        throw new AppError('Failed to delete related Income record', 500);
      }
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

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  const patientID = req.params.patientID;
  const results = await getPatientRecordsByPatientID(patientID, OCT);

  res.status(200).json({
    success: true,
    data: results,
  });
});

const getOctDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'octModule';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getOctDataByYear,
  getOctDataByMonth,
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
  fetchRecordsByPatientId,
  getOctDoctors,
};
