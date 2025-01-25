const mongoose = require('mongoose');
const Operation = require('../models/operationModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDBId');
const calculatePercentage = require('../utils/calculatePercentage');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');

const getOperationDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Operation);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getOperationDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Operation);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new operation
const createOperation = asyncHandler(async (req, res, next) => {
  const { patientId, doctor } = req.body;

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

    // Step 4: Create Operation record
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

    await operation.save({ session });

    // Step 5: Add to DoctorKhata
    if (doctorPercentage > 0 && doctorExist.percentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: operation._id,
            branchModel: 'operationModule',
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
    if (operation.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: operation._id,
            saleModel: 'operationModule',
            date: operation.date,
            totalNetIncome: operation.totalAmount,
            category: 'operation',
            description: 'Operation income',
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
      message: 'Operation created successfully',
      data: operation,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
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
const deleteOperation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the Operation record
    const operation = await Operation.findById(id).session(session);
    if (!operation) {
      throw new AppError('Operation record not found', 404);
    }

    // Step 2: Delete the Operation record
    const deletedRecord = await Operation.findByIdAndDelete(id, { session });
    if (!deletedRecord) {
      throw new AppError('Failed to delete OPERATION record', 500);
    }

    // Step 3: Check and delete related records in DoctorKhata
    const doctorKhataExists = await DoctorKhata.findOne({
      branchNameId: operation._id,
      branchModel: 'operationModule',
    }).session(session);

    if (doctorKhataExists) {
      const doctorKhataResult = await DoctorKhata.deleteOne(
        { branchNameId: operation._id, branchModel: 'operationModule' },
        { session }
      );
      if (doctorKhataResult.deletedCount === 0) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Check and delete related records in Income
    const incomeExists = await Income.findOne({
      saleId: operation._id,
      saleModel: 'operationModule',
    }).session(session);

    if (incomeExists) {
      const incomeResult = await Income.deleteOne(
        { saleId: operation._id, saleModel: 'operationModule' },
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
    res
      .status(204)
      .json({ message: 'Operation and related records deleted successfully' });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  const patientID = req.params.patientID;
  const results = await getPatientRecordsByPatientID(patientID, Operation);

  res.status(200).json({
    success: true,
    data: results,
  });
});

module.exports = {
  getOperationDataByYear,
  getOperationDataByMonth,
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
  fetchRecordsByPatientId,
};
