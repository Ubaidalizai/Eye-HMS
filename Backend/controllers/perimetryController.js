const mongoose = require('mongoose');
const Perimetry = require('../models/perimetryModel');
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

const getPerimetryDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Perimetry);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getPerimetryDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Perimetry);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new operation
const createPerimetry = asyncHandler(async (req, res, next) => {
  const { patientId, perimetryType, doctor } = req.body;

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
      branchModel: 'perimetryModel',
    }).session(session);
    if (!assignedDoctor)
      throw new AppError('Doctor is not assigned to this branch', 403);

    const typeData = await operationTypeModel
      .findById(perimetryType)
      .session(session);
    if (!typeData) throw new AppError('Perimetry type not found', 403);

    req.body.totalAmount = typeData.price;
    let doctorPercentage = assignedDoctor.percentage || 0;

    if (req.body.discount > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        req.body.discount,
        true
      );
      req.body.totalAmount = result.finalPrice;
    }
    
    if (doctorPercentage > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        doctorPercentage
      );
      req.body.totalAmount = result.finalPrice;
      doctorPercentage = result.percentageAmount;
    }

    const perimetry = new Perimetry({
      patientId: patient._id,
      doctor,
      percentage: assignedDoctor.percentage,
      price: typeData.price,
      perimetryType: typeData._id,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await perimetry.save({ session });

    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: perimetry._id,
            branchModel: 'perimetryModel',
            doctorId: doctorExist._id,
            amount: doctorPercentage,
            date: req.body.date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    if (perimetry.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: perimetry._id,
            saleModel: 'perimetryModel',
            date: perimetry.date,
            totalNetIncome: perimetry.totalAmount,
            category: 'perimetry',
            description: 'Perimetry income',
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Perimetry created successfully',
      data: perimetry,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(
      error.message || 'Failed to create perimetry record',
      error.statusCode || 500
    );
  }
});

// Get all operations
const getAllPerimetry = getAll(Perimetry, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
  {
    path: 'perimetryType',
    select: 'name',
  },
]);

const updatePerimetry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const perimetry = await Perimetry.findOneAndUpdate({ id: id }, req.body, {
    new: true, // Return the updated perimetry
  });

  if (!perimetry) {
    throw new AppError('Perimetry not found', 404);
  }

  res.status(200).json({
    message: 'Perimetry updated successfully',
    perimetry,
  });
});

// Delete an perimetry by ID
const deletePerimetry = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  validateMongoDBId(id);

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the Perimetry record
    const perimetry = await Perimetry.findById(id).session(session);
    if (!perimetry) {
      throw new AppError('Perimetry record not found', 404);
    }

    // Step 2: Delete the Perimetry record
    const deletedRecord = await Perimetry.findByIdAndDelete(id, { session });
    if (!deletedRecord) {
      throw new AppError('Failed to delete PERIMETRY record', 500);
    }

    // Step 3: Check and delete related records in DoctorKhata
    const doctorKhataExists = await DoctorKhata.findOne({
      branchNameId: perimetry._id,
      branchModel: 'perimetryModel',
    }).session(session);

    if (doctorKhataExists) {
      const doctorKhataResult = await DoctorKhata.deleteOne(
        { branchNameId: perimetry._id, branchModel: 'perimetryModel' },
        { session }
      );
      if (doctorKhataResult.deletedCount === 0) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Check and delete related records in Income
    const incomeExists = await Income.findOne({
      saleId: perimetry._id,
      saleModel: 'perimetryModel',
    }).session(session);

    if (incomeExists) {
      const incomeResult = await Income.deleteOne(
        { saleId: perimetry._id, saleModel: 'perimetryModel' },
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
      .json({ message: 'Perimetry and related records deleted successfully' });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Field to delete perimetry record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  req.Model = Perimetry;
  const result = await getPatientRecordsByPatientID(req, res);
  res.status(200).json({data: result});
});

const getPerimetryDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'perimetryModel';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getPerimetryDataByYear,
  getPerimetryDataByMonth,
  createPerimetry,
  getAllPerimetry,
  updatePerimetry,
  deletePerimetry,
  fetchRecordsByPatientId,
  getPerimetryDoctors,
};
