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
  const { doctorId } = req.query; // Extract doctorId from query params
  const matchStage = doctorId
    ? { $match: { doctorId: new mongoose.Types.ObjectId(doctorId) } }
    : {}; // Add filter only if doctorId is provided

  const pipeline = [
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

  if (doctorId) pipeline.unshift(matchStage); // Add filter stage dynamically

  const assignments = await DoctorBranchAssignment.aggregate(pipeline);

  res.status(200).json({
    success: true,
    data: assignments,
  });
});

module.exports = {
  assignDoctorToBranch,
  updateDoctorAssignment,
  deleteDoctorAssignment,
  getAllBranchesWithDoctors,
};
