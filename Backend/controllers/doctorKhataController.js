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

exports.getDocKhataSummary = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const doctorObjectId = new mongoose.Types.ObjectId(id);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const summary = await DoctorKhata.aggregate([
    { $match: { doctorId: doctorObjectId } },
    {
      $facet: {
        total: [
          {
            $group: {
              _id: '$amountType',
              totalAmount: { $sum: '$amount' },
            },
          },
        ],
        yearly: [
          { $match: { date: { $gte: startOfYear } } },
          {
            $group: {
              _id: {
                month: { $month: '$date' },
                amountType: '$amountType',
              },
              totalAmount: { $sum: '$amount' },
            },
          },
        ],
        monthly: [
          { $match: { date: { $gte: startOfMonth } } },
          {
            $group: {
              _id: {
                day: { $dayOfMonth: '$date' },
                amountType: '$amountType',
              },
              totalAmount: { $sum: '$amount' },
            },
          },
        ],
        weekly: [
          { $match: { date: { $gte: startOfWeek } } },
          {
            $group: {
              _id: {
                day: { $dayOfWeek: '$date' }, // 1 = Sunday, 7 = Saturday
                amountType: '$amountType',
              },
              totalAmount: { $sum: '$amount' },
            },
          },
        ],
      },
    },
  ]);

  const formatResult = (arr) => {
    const formatted = { income: 0, outcome: 0 };
    arr.forEach((item) => {
      formatted[item._id] = item.totalAmount;
    });
    return formatted;
  };

  const formatPeriodArray = (entries, count, keyName, label) => {
    const result = Array.from({ length: count }, (_, i) => ({
      [label]: i + 1,
      income: 0,
      outcome: 0,
    }));

    entries.forEach((item) => {
      const index = item._id[keyName] - 1;
      if (item._id.amountType === 'income') {
        result[index].income = item.totalAmount;
      } else if (item._id.amountType === 'outcome') {
        result[index].outcome = item.totalAmount;
      }
    });

    return result;
  };

  const total = formatResult(summary[0].total);
  const yearly = formatPeriodArray(summary[0].yearly, 12, 'month', 'month');
  const monthly = formatPeriodArray(summary[0].monthly, 30, 'day', 'day');
  const weekly = formatPeriodArray(summary[0].weekly, 7, 'day', 'day');

  const balance = total.income - total.outcome;
  const youWillGet = balance < 0 ? Math.abs(balance) : 0;
  const youWillGive = balance >= 0 ? balance : 0;

  res.status(200).json({
    status: 'success',
    data: {
      total,
      yearly,
      monthly,
      weekly,
      youWillGet,
      youWillGive,
    },
  });
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
