const mongoose = require('mongoose');
const Ultrasound = require('../models/ultraSoundModule');
const User = require('../models/userModel');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const asyncHandler = require('../middlewares/asyncHandler');
const getAll = require('./handleFactory');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDBId');
const calculatePercentage = require('../utils/calculatePercentage');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');

const getUltrasoundDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Ultrasound);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getUltrasoundDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Ultrasound);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Get all ultrasound records
const getAllRecords = getAll(Ultrasound, false, [
  { path: 'patientId', select: 'name' },
  {
    path: 'doctor',
    select: 'firstName lastName percentage',
  },
]);

// Get a single record by custom schema id
const getRecordById = asyncHandler(async (req, res) => {
  const record = await Ultrasound.findOne({ id: req.params.id }); // Using schema-defined 'id'
  if (!record) {
    throw new AppError('Record not found', 404);
  }
  res.status(200).json(record);
});

// Add a new record
const addRecord = asyncHandler(async (req, res, next) => {
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
      throw new AppError('Patient not exist', 404);
    }

    // Step 2: Validate doctor
    const doctorExist = await User.findById(doctor).session(session);
    if (!doctorExist || doctorExist.role !== 'doctor') {
      throw new AppError('Doctor not exist', 404);
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

    // Step 4: Create Ultrasound record
    const ultrasound = new Ultrasound({
      patientId: patient._id,
      doctor: doctor,
      percentage: doctorExist.percentage,
      price: req.body.price,
      time: req.body.time,
      date: req.body.date,
      discount: req.body.discount,
      totalAmount: req.body.totalAmount,
    });

    await ultrasound.save({ session });

    // Step 5: Add to DoctorKhata
    if (doctorPercentage > 0 && doctorExist.percentage > 0)
      await DoctorKhata.create(
        [
          {
            branchNameId: ultrasound._id,
            branchModel: 'ultraSoundModule',
            doctorId: doctorExist._id,
            amount: doctorPercentage,
            date: req.body.date,
            amountType: 'income',
          },
        ],
        { session }
      );

    // Step 6: Add to Income
    if (ultrasound.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: ultrasound._id,
            saleModel: 'ultraSoundModule',
            date: ultrasound.date,
            totalNetIncome: ultrasound.totalAmount,
            category: 'ultrasound',
            description: 'Ultrasound income',
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
      message: 'Ultrasound added successfully',
      data: ultrasound,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// Update an existing record by custom schema id
const updateRecord = asyncHandler(async (req, res) => {
  validateMongoDBId(req.params.id);

  const updatedRecord = await Ultrasound.findOneAndUpdate(
    { id: req.params.id }, // Use schema 'id' for lookup
    req.body,
    { new: true, runValidators: true } // Ensure validation on update
  );

  if (!updatedRecord) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json(updatedRecord);
});

// Delete a record by custom schema id
const deleteRecord = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the Ultrasound record
    const ultrasoundRecord = await Ultrasound.findById(id).session(session);
    if (!ultrasoundRecord) {
      throw new AppError('Record not found', 404);
    }

    // Step 2: Delete the Ultrasound record
    const deletedRecord = await Ultrasound.findByIdAndDelete(id, { session });
    if (!deletedRecord) {
      throw new AppError('Failed to delete record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: ultrasoundRecord._id, branchModel: 'ultraSoundModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      throw new AppError('Failed to delete related DoctorKhata record', 500);
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: ultrasoundRecord._id, saleModel: 'ultraSoundModule' },
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
      message: 'Record and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

module.exports = {
  getUltrasoundDataByYear,
  getUltrasoundDataByMonth,
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
