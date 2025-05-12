const mongoose = require('mongoose');
const DoctorKhata = require('../models/doctorKhataModel');
const User = require('../models/userModel');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const { getDataByYear, getDataByMonth } = require('../utils/branchesStatics');

exports.createDoctorKhata = asyncHandler(async (req, res) => {
  const { doctorId, amount, amountType, date } = req.body;

  if (!doctorId || !amount || !amountType || !date) {
    throw new AppError('All fields are required', 400);
  }

  // If user is not a receptionist, then they must be a doctor assigned to a branch
  if (req.user.role !== 'receptionist') {
    const doctor = await DoctorBranchAssignment.findOne({ doctorId });
    if (!doctor) {
      throw new AppError('Doctor not assigned to a branch', 400);
    }
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

exports.getDoctorKhataById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const amountType = req.query.amountType;

  // Check if doctor exists
  const doctor = await User.findById(id);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  let doctorKhata;
  if (amountType) {
    doctorKhata = await DoctorKhata.find({ doctorId: id, amountType })
      .select('amount date branchNameId branchModel')
      .populate('branchNameId'); // Dynamic population based on branchModel
  } else {
    doctorKhata = await DoctorKhata.find({ doctorId: id })
      .select('amount date branchNameId branchModel')
      .populate('branchNameId');
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

exports.getDocKhataSummary = asyncHandler(async (req, res) => {
  const doctorId = new mongoose.Types.ObjectId(req.params.id);

  // Aggregate only total income/outcome
  const summary = await DoctorKhata.aggregate([
    { $match: { doctorId } },
    {
      $group: {
        _id: '$amountType',
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  // Extract income/outcome totals
  const totals = { income: 0, outcome: 0 };
  summary.forEach((entry) => {
    if (entry._id === 'income') totals.income = entry.totalAmount;
    if (entry._id === 'outcome') totals.outcome = entry.totalAmount;
  });

  const balance = totals.income - totals.outcome;
  const youWillGet = balance > 0 ? balance : 0;
  const youWillGive = balance < 0 ? Math.abs(balance) : 0;

  res.status(200).json({
    status: 'success',
    data: {
      totalIncome: totals.income,
      totalOutcome: totals.outcome,
      balance,
      youWillGet,
      youWillGive,
    },
  });
});

exports.getDoctorYearlyKhataStats = asyncHandler(async (req, res) => {
  const { id, year } = req.params;
  const doctorObjectId = new mongoose.Types.ObjectId(id);
  const numericYear = parseInt(year, 10);

  const startOfYear = new Date(numericYear, 0, 1);
  const endOfYear = new Date(numericYear + 1, 0, 1);

  const yearlyStats = await DoctorKhata.aggregate([
    {
      $match: {
        doctorId: doctorObjectId,
        date: { $gte: startOfYear, $lt: endOfYear },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          amountType: '$amountType',
        },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    outcome: 0,
  }));

  yearlyStats.forEach((entry) => {
    const index = entry._id.month - 1;
    if (entry._id.amountType === 'income') {
      monthly[index].income = entry.totalAmount;
    } else {
      monthly[index].outcome = entry.totalAmount;
    }
  });

  res.status(200).json({
    status: 'success',
    data: { year: numericYear, stats: monthly },
  });
});

exports.getDoctorMonthlyKhataStats = asyncHandler(async (req, res) => {
  const { id, year, month } = req.params;
  const doctorObjectId = new mongoose.Types.ObjectId(id);
  const y = parseInt(year, 10);
  const m = parseInt(month, 10) - 1; // JS months are 0-indexed

  const startOfMonth = new Date(y, m, 1);
  const endOfMonth = new Date(y, m + 1, 1);

  const monthlyStats = await DoctorKhata.aggregate([
    {
      $match: {
        doctorId: doctorObjectId,
        date: { $gte: startOfMonth, $lt: endOfMonth },
      },
    },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$date' },
          amountType: '$amountType',
        },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    income: 0,
    outcome: 0,
  }));

  monthlyStats.forEach((entry) => {
    const index = entry._id.day - 1;
    if (entry._id.amountType === 'income') {
      days[index].income = entry.totalAmount;
    } else {
      days[index].outcome = entry.totalAmount;
    }
  });

  res.status(200).json({
    status: 'success',
    data: { year: y, month: m + 1, stats: days },
  });
});
