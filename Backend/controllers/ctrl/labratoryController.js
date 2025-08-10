const Laboratory = require('../models/labratoryModule');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const User = require('../models/userModel');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const mongoose = require('mongoose');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');
const getDoctorsByBranch = require('../utils/getDoctorsByBranch');
const operationTypeModel = require('../models/operationTypeModel');

const getLaboratoryDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Laboratory);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getLaboratoryDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Laboratory);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new lab record
const createLabRecord = asyncHandler(async (req, res) => {
  const { patientId, doctor, time, date, discount, type } = req.body;

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

    // Step 3: Check if doctor is assigned to this branch
    const doctorAssignment = await DoctorBranchAssignment.findOne({
      doctorId: doctor,
      branchModel: 'labratoryModule',
    }).session(session);

    if (!doctorAssignment) {
      throw new AppError('This doctor is not assigned to this branch', 400);
    }

    const findOperationType = await operationTypeModel
      .findById(type)
      .session(session);
    if (!findOperationType) {
      throw new AppError('Operation type not found', 403);
    }
    // Step 4: Calculate total amount and doctor percentage
    req.body.totalAmount = findOperationType.price;
    let doctorPercentage = doctorAssignment.percentage || 0; // Use assigned percentage

    if (doctorPercentage > 0) {
      const result = await calculatePercentage(
        findOperationType.price,
        doctorPercentage
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

    // Step 5: Create Laboratory Record
    const laboratory = new Laboratory({
      patientId: patient._id,
      doctor,
      percentage: doctorAssignment.percentage,
      price: findOperationType.price,
      type,
      time,
      date,
      discount,
      totalAmount: req.body.totalAmount,
    });
    await laboratory.save({ session });

    // Step 6: Create DoctorKhata Record
    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: laboratory._id,
            branchModel: 'labratoryModule',
            doctorId: doctor,
            amount: doctorPercentage,
            date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    // Step 7: Create Income Record
    if (laboratory.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: laboratory._id,
            saleModel: 'labratoryModule',
            date,
            totalNetIncome: laboratory.totalAmount,
            category: 'laboratory',
            description: 'Laboratory income',
          },
        ],
        { session }
      );
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Lab record created successfully',
      data: laboratory,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to create lab record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

// Get all lab records
const getAllLabRecords = getAll(Laboratory, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
  {
    path: 'type',
    select: 'name',
  },
]);

// Get a specific lab record by patientId
const getLabRecordByPatientId = asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const labRecord = await Laboratory.findOne({ patientId });
  if (!labRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res
    .status(200)
    .json({ message: 'Lab record retrieved successfully', data: labRecord });
});

// Update a lab record by patientId
const updateLabRecordById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedLabRecord = await Laboratory.findOneAndUpdate({ id }, req.body, {
    new: true,
  });
  if (!updatedLabRecord) {
    throw new AppError('Lab record not found', 404);
  }
  res.status(200).json({
    message: 'Lab record updated successfully',
    data: updatedLabRecord,
  });
});

// Delete a lab record by patientId
const deleteLabRecordById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the Lab record
    const labRecord = await Laboratory.findById(id).session(session);
    if (!labRecord) {
      throw new AppError('Lab record not found', 404);
    }

    // Step 2: Delete the Lab record
    const deletedLabRecord = await Laboratory.findByIdAndDelete(id, {
      session,
    });
    if (!deletedLabRecord) {
      throw new AppError('Failed to delete Lab record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: labRecord._id, branchModel: 'labratoryModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      const doctorKhataExists = await DoctorKhata.findOne({
        branchNameId: labRecord._id,
        branchModel: 'labratoryModule',
      }).session(session);

      if (doctorKhataExists) {
        throw new AppError('Failed to delete related DoctorKhata record', 500);
      }
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: labRecord._id, saleModel: 'labratoryModule' },
      { session }
    );

    if (incomeResult.deletedCount === 0) {
      const incomeExists = await Income.findOne({
        saleId: labRecord._id,
        saleModel: 'labratoryModule',
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
      message: 'Lab record and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to delete lab record';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  req.Model = Laboratory;
  const result = await getPatientRecordsByPatientID(req, res);
  res.status(200).json({data: result});
});

const getLaboratoryDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'labratoryModule';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getLaboratoryDataByYear,
  getLaboratoryDataByMonth,
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
  fetchRecordsByPatientId,
  getLaboratoryDoctors,
};
