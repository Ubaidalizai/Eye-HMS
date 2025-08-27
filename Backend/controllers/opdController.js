const mongoose = require('mongoose');
const OPD = require('../models/opdModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');
const getDoctorsByBranch = require('../utils/getDoctorsByBranch');
const validateMongoDBId = require('../utils/validateMongoDbId');

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
const addRecord = asyncHandler(async (req, res, next) => {
  const { patientId, doctor } = req.body;
  console.log(req.body);
  if (!patientId || !doctor) {
    throw new AppError('Patient ID and Doctor ID are required', 400);
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

    // Step 2: Validate doctor
    const doctorExist = await User.findById(doctor).session(session);
    if (!doctorExist || doctorExist.role !== 'doctor') {
      throw new AppError('Doctor not found', 404);
    }

    // Step 3: Check if doctor is assigned to OPD module
    const assignedDoctor = await DoctorBranchAssignment.findOne({
      doctorId: doctorExist._id,
      branchModel: 'opdModule',
    }).session(session);

    if (!assignedDoctor) {
      throw new AppError('Doctor is not assigned to this branch', 403);
    }

    // Step 4: Calculate total amount and doctor percentage
    req.body.totalAmount = assignedDoctor.price;
    let doctorPercentage = assignedDoctor.percentage || 0; // Use assigned percentage

    if (doctorPercentage > 0) {
      const result = await calculatePercentage(
        assignedDoctor.price,
        doctorPercentage
      );
      req.body.totalAmount = result.finalPrice;
      doctorPercentage = result.percentageAmount;
    }

    if (req.body.discount > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        req.body.discount,
        true,
      );
      req.body.totalAmount = result.finalPrice;
    }

    // Step 5: Create OPD record
    const opdRecord = new OPD({
      patientId: patient._id,
      doctor: doctor,
      percentage: assignedDoctor.percentage,
      price: assignedDoctor.price,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await opdRecord.save({ session });

    // Step 6: Add to DoctorKhata
    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: opdRecord._id,
            branchModel: 'opdModule',
            doctorId: doctorExist._id,
            amount: doctorPercentage,
            date: req.body.date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    // Step 7: Add to Income
    if (opdRecord.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: opdRecord._id,
            saleModel: 'opdModule',
            date: opdRecord.date,
            totalNetIncome: opdRecord.totalAmount,
            category: 'opd',
            description: 'OPD income',
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
      message: 'OPD record created successfully',
      data: opdRecord,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to create OPD record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
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

  // Validate MongoDB ID
  validateMongoDBId(id);

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the OPD record
    const opdRecord = await OPD.findById(id).session(session);
    if (!opdRecord) {
      throw new AppError('Record not found', 404);
    }

    // Step 2: Delete the OPD record
    const deletedRecord = await OPD.findByIdAndDelete(id, { session });
    if (!deletedRecord) {
      throw new AppError('Failed to delete OPD record', 500);
    }

    // Step 3: Check and delete related records in DoctorKhata
    const doctorKhataExists = await DoctorKhata.findOne({
      branchNameId: opdRecord._id,
      branchModel: 'opdModule',
    }).session(session);

    if (doctorKhataExists) {
      const doctorKhataResult = await DoctorKhata.deleteOne(
        { branchNameId: opdRecord._id, branchModel: 'opdModule' },
        { session }
      );

      if (doctorKhataResult.deletedCount === 0) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Check and delete related records in Income
    const incomeExists = await Income.findOne({
      saleId: opdRecord._id,
      saleModel: 'opdModule',
    }).session(session);

    if (incomeExists) {
      const incomeResult = await Income.deleteOne(
        { saleId: opdRecord._id, saleModel: 'opdModule' },
        { session }
      );

      if (incomeResult.deletedCount === 0) {
        throw new AppError('Failed to delete related Income record', 500);
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(204).json();
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to delete OPD record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  req.Model = OPD;
  const result = await getPatientRecordsByPatientID(req, res);
  res.status(200).json({data: result});
});

const getOpdDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'opdModule';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getOpdDataByYear,
  getOpdDataByMonth,
  getAllRecords,
  getRecordByPatientId,
  addRecord,
  updateRecordByPatientId,
  deleteRecordByPatientId,
  fetchRecordsByPatientId,
  getOpdDoctors,
};
