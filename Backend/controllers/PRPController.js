const mongoose = require('mongoose');
const PRP = require('../models/PRPModel');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const operationTypeModel = require('../models/operationTypeModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDbId');
const calculatePercentage = require('../utils/calculatePercentage');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');
const getDoctorsByBranch = require('../utils/getDoctorsByBranch');

const getPRPDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, PRP);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getPRPDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, PRP);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new operation
const createPRP = asyncHandler(async (req, res) => {
  const { patientId, PRPType, doctor } = req.body;
  console.log(req.body);
  if (!patientId || !doctor) {
    throw new AppError('Patient ID and Doctor ID are required', 400);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const patient = await Patient.findOne({ patientID: patientId }).session(
      session
    );
    if (!patient) throw new AppError('Patient not found', 404);

    const doctorExist = await User.findById(doctor).session(session);
    if (!doctorExist || doctorExist.role !== 'doctor') {
      throw new AppError('Doctor not found', 404);
    }

    const assignedDoctor = await DoctorBranchAssignment.findOne({
      doctorId: doctorExist._id,
      branchModel: 'PRPModel',
    }).session(session);
    if (!assignedDoctor)
      throw new AppError('Doctor is not assigned to this branch', 403);

    const typeData = await operationTypeModel
      .findById(PRPType)
      .session(session);
    if (!typeData) throw new AppError('PRP type not found', 403);

    req.body.totalAmount = typeData.price;
    let doctorPercentage = assignedDoctor.percentage || 0;

    if (doctorPercentage > 0) {
      const result = await calculatePercentage(
        typeData.price,
        doctorPercentage
      );
      req.body.totalAmount = result.finalPrice;
      doctorPercentage = result.percentageAmount;
    }

    if (req.body.discount > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        req.body.discount,
        true
      );
      req.body.totalAmount = result.finalPrice;
    }

    const prp = new PRP({
      patientId: patient._id,
      doctor,
      percentage: assignedDoctor.percentage,
      price: typeData.price,
      PRPType: typeData._id,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await prp.save({ session });

    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: prp._id,
            branchModel: 'PRPModel',
            doctorId: doctorExist._id,
            amount: doctorPercentage,
            date: req.body.date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    if (prp.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: prp._id,
            saleModel: 'PRPModel',
            date: prp.date,
            totalNetIncome: prp.totalAmount,
            category: 'prp',
            description: 'PRP income',
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'PRP created successfully',
      data: prp,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      error.message || 'Failed to create prp record',
      error.statusCode || 500
    );
  }
});

// Get all operations
const getAllPRP = getAll(PRP, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
  {
    path: 'PRPType',
    select: 'name',
  },
]);

const updatePRP = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const prp = await PRP.findOneAndUpdate({ id: id }, req.body, {
    new: true, // Return the updated prp
  });

  if (!prp) {
    throw new AppError('PRP not found', 404);
  }

  res.status(200).json({
    message: 'PRP updated successfully',
    prp,
  });
});

// Delete an prp by ID
const deletePRP = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDBId(id);

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the PRP record
    const prp = await PRP.findById(id).session(session);
    if (!prp) {
      throw new AppError('PRP record not found', 404);
    }

    // Step 2: Delete the PRP record
    const deletedRecord = await PRP.findByIdAndDelete(id, { session });
    if (!deletedRecord) {
      throw new AppError('Failed to delete PERIMETRY record', 500);
    }

    // Step 3: Check and delete related records in DoctorKhata
    const doctorKhataExists = await DoctorKhata.findOne({
      branchNameId: prp._id,
      branchModel: 'PRPModel',
    }).session(session);

    if (doctorKhataExists) {
      const doctorKhataResult = await DoctorKhata.deleteOne(
        { branchNameId: prp._id, branchModel: 'PRPModel' },
        { session }
      );
      if (doctorKhataResult.deletedCount === 0) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Check and delete related records in Income
    const incomeExists = await Income.findOne({
      saleId: prp._id,
      saleModel: 'PRPModel',
    }).session(session);

    if (incomeExists) {
      const incomeResult = await Income.deleteOne(
        { saleId: prp._id, saleModel: 'PRPModel' },
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
      .json({ message: 'PRP and related records deleted successfully' });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Field to delete prp record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  req.Model = PRP;
  const result = await getPatientRecordsByPatientID(req, res);
  res.status(200).json({data: result});
});

const getPRPDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'PRPModel';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getPRPDataByYear,
  getPRPDataByMonth,
  createPRP,
  getAllPRP,
  updatePRP,
  deletePRP,
  fetchRecordsByPatientId,
  getPRPDoctors,
};
