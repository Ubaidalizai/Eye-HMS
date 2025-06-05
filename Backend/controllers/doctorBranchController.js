const DoctorBranchAssignment = require('../models/doctorBranchModel');
const User = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

const assignDoctorToBranch = asyncHandler(async (req, res) => {
  const { doctorId, branchModel, percentage, price } = req.body;

  if (!doctorId || !branchModel) {
    throw new AppError('Doctor and branch model are required', 400);
  }

  if (percentage < 0 || percentage > 100 || percentage === '') {
    throw new AppError('Percentage must be between 0 and 100', 400);
  }

  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    throw new AppError('Doctor not found', 404);
  }

  const existingAssignment = await DoctorBranchAssignment.findOne({
    doctorId,
    branchModel,
  });
  if (existingAssignment) {
    throw new AppError('Doctor is already assigned to this branch', 400);
  }

  const newAssignment = await DoctorBranchAssignment.create({
    doctorId,
    branchModel,
    percentage,
    price,
  });

  res.status(201).json({
    success: true,
    message: 'Doctor assigned to branch successfully',
    data: newAssignment,
  });
});

const updateDoctorAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { percentage, price } = req.body;

  if (percentage < 0 || percentage > 100) {
    throw new AppError('Percentage must be between 0 and 100', 400);
  }

  const assignment = await DoctorBranchAssignment.findByIdAndUpdate(
    id,
    { percentage, price },
    { new: true }
  );

  if (!assignment) {
    throw new AppError('Doctor assignment not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment,
  });
});

const deleteDoctorAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await DoctorBranchAssignment.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Assignment not found', 404);
  }

  res
    .status(200)
    .json({ success: true, message: 'Doctor unassigned successfully' });
});

const getAllBranchesWithDoctors = asyncHandler(async (req, res, next) => {
  const { doctorId, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const matchStage = doctorId
    ? { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } }
    : null;

  const basePipeline = [
    {
      $lookup: {
        from: 'users',
        localField: 'doctorId',
        foreignField: '_id',
        as: 'doctor',
      },
    },
    { $unwind: '$doctor' },
    {
      $project: {
        doctorId: '$doctor._id',
        doctorName: {
          $concat: ['$doctor.firstName', ' ', '$doctor.lastName'],
        },
        email: '$doctor.email',
        image: '$doctor.image',
        branch: '$branchModel',
        percentage: 1,
        price: 1,
      },
    },
  ];

  // Full pipeline with optional match, and pagination
  const pipeline = [];
  if (matchStage) pipeline.push(matchStage);
  pipeline.push(...basePipeline);
  pipeline.push({ $skip: skip }, { $limit: limitNumber });

  // Count total documents (without pagination)
  const countPipeline = [];
  if (matchStage) countPipeline.push(matchStage);
  countPipeline.push(...basePipeline, { $count: 'total' });

  const [assignments, countResult] = await Promise.all([
    DoctorBranchAssignment.aggregate(pipeline),
    DoctorBranchAssignment.aggregate(countPipeline),
  ]);

  const totalDocs = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalDocs / limitNumber);

  res.status(200).json({
    success: true,
    currentPage: pageNumber,
    totalPages,
    totalResults: totalDocs,
    data: assignments,
  });
});

module.exports = {
  assignDoctorToBranch,
  updateDoctorAssignment,
  deleteDoctorAssignment,
  getAllBranchesWithDoctors,
};
