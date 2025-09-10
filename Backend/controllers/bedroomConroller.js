const Bedroom = require('../models/bedroomModule');
const Patient = require('../models/patientModel');
const DoctorKhata = require('../models/doctorKhataModel');
const Income = require('../models/incomeModule');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const mongoose = require('mongoose');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const getAll = require('./handleFactory');
const validateMongoDBId = require('../utils/validateMongoDbId');
const calculatePercentage = require('../utils/calculatePercentage');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');
const getPatientRecordsByPatientID = require('../utils/searchBranches');
const getDoctorsByBranch = require('../utils/getDoctorsByBranch');
const operationTypeModel = require('../models/operationTypeModel');

const getBedroomDataByYear = asyncHandler(async (req, res) => {
  const { year } = req.params;

  const chartData = await getDataByYear(year, Bedroom);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

const getBedroomDataByMonth = asyncHandler(async (req, res) => {
  const { year, month } = req.params;

  const chartData = await getDataByMonth(year, month, Bedroom);

  res.status(200).json({
    success: true,
    data: chartData,
  });
});

// Create a new bedroom
const createBedroom = asyncHandler(async (req, res, next) => {
  const { patientId, doctor, time, type, date, discount } = req.body;

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

    // Step 2: Check if doctor is assigned to this branch
    const doctorAssignment = await DoctorBranchAssignment.findOne({
      doctorId: doctor,
      branchModel: 'bedroomModule',
    }).session(session);

    if (!doctorAssignment) {
      throw new AppError('Doctor is not assigned to this branch', 400);
    }

    // Step 3: Calculate total amount after doctor percentage & discount
    const typeExist = await operationTypeModel.findById(type).session(session);
    if (!typeExist) {
      throw new AppError('Bedroom type not found', 403);
    }
    // Step 4: Calculate total amount and doctor percentage
    req.body.totalAmount = typeExist.price;
    const doctorPercentage = doctorAssignment.percentage;
    let doctorIncome = 0;

    if (discount > 0) {
      const discountResult = await calculatePercentage(
        req.body.totalAmount,
        discount,
        true
      );
      req.body.totalAmount = discountResult.finalPrice;
    }

    if (doctorPercentage > 0) {
      const result = await calculatePercentage(
        req.body.totalAmount,
        doctorPercentage
      );
      doctorIncome = result.percentageAmount;
      req.body.totalAmount = result.finalPrice;
    }

    // Step 4: Create Bedroom Record
    const bedroom = new Bedroom({
      patientId: patient._id,
      time,
      date,
      rent: typeExist.price,
      doctor,
      type,
      percentage: doctorAssignment.percentage,
      discount,
      totalAmount: req.body.totalAmount,
    });
    await bedroom.save({ session });

    // Step 5: Create DoctorKhata Record
    if (doctorIncome > 0) {
      await DoctorKhata.create(
        [
          {
            branchNameId: bedroom._id,
            branchModel: 'bedroomModule',
            doctorId: doctor,
            amount: doctorIncome,
            date,
            amountType: 'income',
          },
        ],
        { session }
      );
    }

    // Step 6: Create Income Record
    if (req.body.totalAmount > 0) {
      await Income.create(
        [
          {
            saleId: bedroom._id,
            saleModel: 'bedroomModule',
            date,
            totalNetIncome: req.body.totalAmount,
            category: 'bedroom',
            description: 'Bedroom income',
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
      message: 'Bedroom created successfully',
      data: bedroom,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to create bedroom';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

// Get all bedrooms
const getAllBedrooms = getAll(Bedroom, false, [
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

// Get a bedroom by schema `id`
const getBedroomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOne({ id }); // Find by schema-defined `id`

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom retrieved successfully',
    data: bedroom,
  });
});

// Update a bedroom by schema `id`
const updateBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validateMongoDBId(id);

  const bedroom = await Bedroom.findOneAndUpdate({ id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bedroom) {
    throw new AppError('Bedroom not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Bedroom updated successfully',
    data: bedroom,
  });
});

// Delete a bedroom by schema `id`
const deleteBedroom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Validate MongoDB ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError('Invalid ID provided', 400);
  }

  // Start a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Find the bedroom record
    const bedroom = await Bedroom.findById(id).session(session);
    if (!bedroom) {
      throw new AppError('Bedroom not found', 404);
    }

    // Step 2: Delete the bedroom record
    const deletedBedroom = await Bedroom.findByIdAndDelete(id, { session });
    if (!deletedBedroom) {
      throw new AppError('Failed to delete bedroom record', 500);
    }

    // Step 3: Delete related records in DoctorKhata
    const doctorKhataResult = await DoctorKhata.deleteOne(
      { branchNameId: bedroom._id, branchModel: 'bedroomModule' },
      { session }
    );

    if (doctorKhataResult.deletedCount === 0) {
      const doctorKhataExists = await DoctorKhata.findOne({
        branchNameId: bedroom._id,
        branchModel: 'bedroomModule',
      }).session(session);

      if (doctorKhataExists) {
        throw new AppError('Failed to delete related doctor khata record', 500);
      }
    }

    // Step 4: Delete related records in Income
    const incomeResult = await Income.deleteOne(
      { saleId: bedroom._id, saleModel: 'bedroomModule' },
      { session }
    );

    if (incomeResult.deletedCount === 0) {
      const incomeExists = await Income.findOne({
        saleId: bedroom._id,
        saleModel: 'bedroomModule',
      }).session(session);

      if (incomeExists) {
        throw new AppError('Failed to delete related income record', 500);
      }
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Bedroom and related records deleted successfully',
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    const errorMessage = error.message || 'Failed to delete bedroom';
    throw new AppError(errorMessage, error.statusCode || 500);
  }
});

const fetchRecordsByPatientId = asyncHandler(async (req, res) => {
  req.Model = Bedroom;
  const result = await getPatientRecordsByPatientID(req, res);
  res.status(200).json({data: result});
});

const getBedroomDoctors = asyncHandler(async (req, res, next) => {
  const branchModel = 'bedroomModule';
  const doctors = await getDoctorsByBranch(branchModel);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});

module.exports = {
  getBedroomDataByYear,
  getBedroomDataByMonth,
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
  fetchRecordsByPatientId,
  getBedroomDoctors,
};
