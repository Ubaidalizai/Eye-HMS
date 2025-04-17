const DoctorKhata = require('../models/doctorKhataModel');
const User = require('../models/userModel');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

exports.createDoctorKhata = asyncHandler(async (req, res) => {
  const { doctorId, amount, amountType, date } = req.body;

  if (!doctorId || !amount || !amountType || !date) {
    throw new AppError('All fields are required', 400);
  }

  // Check if doctor exists in User model and has percentage
  const doctor = await DoctorBranchAssignment.findOne({ doctorId });
  if (!doctor) {
    throw new AppError('Doctor not assigned to a branch', 400);
  }

  const doctorKhata = new DoctorKhata({
    branchNameId: new mongoose.Types.ObjectId(),
    branchModel: 'DoctorKhata',
    doctorId,
    amount,
    amountType,
    date,
  });
  await doctorKhata.save();

  res.status(201).json({ message: 'Record created successfully' });
});

exports.getDocKhataSummary = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await DoctorKhata.aggregate([
    {
      $match: { doctorId: new mongoose.Types.ObjectId(id) }, // Filter by doctorId
    },
    {
      $group: {
        _id: '$amountType', // Group by 'amountType' (income or outcome)
        totalAmount: { $sum: '$amount' }, // Sum 'amount' for each type
      },
    },
  ]);
  // Format the result as an object for clarity
  const summary = {
    income: 0,
    outcome: 0,
  };

  result.forEach((item) => {
    summary[item._id] = item.totalAmount; // Populate income and outcome
  });

  let youWillGet, youWillGive;
  let greater = summary.income - summary.outcome;
  if (greater > 0) {
    youWillGive = greater;
    youWillGet = 0;
  } else {
    youWillGet = Math.abs(greater);
    youWillGive = 0;
  }

  // Send the response
  res.status(200).json({
    status: 'success',
    data: {
      youWillGive,
      youWillGet,
    },
  });
});

exports.getDoctorKhataById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const amountType = req.query.amountType;

  // Check if doctor exists in User model and has percentage
  const doctor = await User.findById(id);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  let doctorKhata;
  if (amountType) {
    doctorKhata = await DoctorKhata.find({ doctorId: id, amountType }).select(
      'amount date'
    );
  } else {
    doctorKhata = await DoctorKhata.find({ doctorId: id }).select(
      'amount date'
    );
  }

  res.status(200).json(doctorKhata);
});

exports.updateDoctorKhata = async (req, res) => {
  try {
    const id = req.params.id;
    const { amount, description } = req.body;
    const doctorKhata = await DoctorKhata.findById(id);
    if (!doctorKhata) {
      return res.status(404).json({ message: 'Record not found' });
    }
    doctorKhata.amount = amount;
    doctorKhata.description = description;
    await doctorKhata.save();
    res.status(200).json({ message: 'Record updated successfully' });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Error updating record', error: err.message });
  }
};

exports.deleteDoctorKhata = async (req, res) => {
  try {
    const id = req.params.id;
    const doctorKhata = await DoctorKhata.findByIdAndDelete(id);
    if (!doctorKhata) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Error deleting record', error: err.message });
  }
};
