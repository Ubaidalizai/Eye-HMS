const mongoose = require('mongoose');
const DoctorBranchAssignment = require('../models/doctorBranchModel');

const getDoctorsByBranch = async (branchModel) => {
  try {
    const assignedDoctors = await DoctorBranchAssignment.aggregate([
      { $match: { branchModel } }, // Filter by the specific branch
      {
        $lookup: {
          from: 'users', // Join with the Users collection
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctor',
        },
      },
      { $unwind: '$doctor' }, // Flatten the doctor data
      {
        $project: {
          doctorId: '$doctor._id',
          doctorName: {
            $concat: ['$doctor.firstName', ' ', '$doctor.lastName'],
          },
        },
      },
    ]);

    return assignedDoctors;
  } catch (error) {
    console.error('Error fetching doctors for branch:', error);
    throw error;
  }
};

module.exports = getDoctorsByBranch;
