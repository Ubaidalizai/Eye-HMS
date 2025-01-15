// controllers/laboratoryController.js
const Laboratory = require('../models/labratoryModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const mongoose = require('mongoose');
const calculatePercentage = require('../utils/calculatePercentage');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');

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
const createLabRecord = asyncHandler(async (req, res, next) => {
  const { patientId, doctor } = req.body;

  // Start a MongoDB session for the transaction
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

    // Step 4: Create laboratory record
    const laboratory = new Laboratory({
      patientId: patient._id,
      doctor: doctor,
      percentage: doctorExist.percentage,
      price: req.body.price,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await laboratory.save({ session });

    // Step 5: Add to DoctorKhata
    if (doctorPercentage > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: laboratory._id,
            branchModel: 'labratoryModule',
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
    if (laboratory.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: laboratory._id,
            saleModel: 'labratoryModule',
            date: laboratory.date,
            totalNetIncome: laboratory.totalAmount,
            category: 'laboratory',
            description: 'Laboratory income',
          },
        ],
        { session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with success
    res.status(201).json({
      message: 'Lab record created successfully',
      data: laboratory,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// Get all lab records
const getAllLabRecords = getAll(Laboratory, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
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
    // Step 1: Find and delete the lab record
    const labRecord = await Laboratory.findById(id).session(session);
    if (!labRecord) {
      throw new AppError('Lab record not found', 404);
    }

    await Laboratory.findByIdAndDelete(id, { session });

    // Step 2: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: labRecord._id, branchModel: 'labratoryModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      throw new AppError('Failed to delete related DoctorKhata record', 500);
    }

    // Step 3: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: labRecord._id, saleModel: 'labratoryModule' },
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
      message: 'Lab record and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

module.exports = {
  getLaboratoryDataByYear,
  getLaboratoryDataByMonth,
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
};
