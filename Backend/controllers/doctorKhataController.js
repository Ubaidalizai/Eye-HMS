const mongoose = require('mongoose');
const DoctorKhata = require('../models/doctorKhataModel');
const User = require('../models/userModel');
const DoctorBranchAssignment = require('../models/doctorBranchModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongodbId = require('../utils/validateMongoDbId');

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

const branchNameMap = {
  opdModule: 'OPD',
  glassModel: 'Glasses',
  labratoryModule: 'Laboratory',
  operationModule: 'Operation',
  ultraSoundModule: 'Ultrasound',
  yeglizerModel: 'Yeglezer',
  bedroomModule: 'Bedroom',
  octModule: 'OCT',
  DoctorKhata: 'Doctor',
};

exports.getDoctorKhataRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {
      doctorId: req.user.id,
    };

    // Filter by date
    if (date) {
      query.date = new Date(date);
    }

    // Fetch total count for pagination
    const total = await DoctorKhata.countDocuments(query);

    // Fetch data with dynamic population
    const records = await DoctorKhata.find(query)
      .populate('doctorId', 'firstName lastName')
      .sort({ date: -1 }) // latest first
      .skip(skip)
      .limit(parseInt(limit));

    // Format results
    const results = records.map((record) => ({
      doctorName: `${record.doctorId?.firstName || 'N/A'} ${
        record.doctorId?.lastName || 'N/A'
      }`,
      branchName: branchNameMap[record.branchModel] || record.branchModel,
      amountType: record.amountType,
      amount: record.amount,
      date: record.date,
    }));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      results,
    });
  } catch (error) {
    console.error('Error fetching doctor khata records:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getDoctorKhataById = asyncHandler(async (req, res) => {
  const doctorId = req.params.id;
  const amountType = req.query.amountType;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Check if doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor) {
    throw new AppError('Doctor not found.', 404);
  }

  const filter = { doctorId };
  if (amountType) {
    filter.amountType = amountType;
  }

  const [records, total] = await Promise.all([
    DoctorKhata.find(filter)
      .select('amount date branchNameId branchModel amountType')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('branchNameId'),
    DoctorKhata.countDocuments(filter),
  ]);

  res.status(200).json({
    status: 'success',
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
    results: records,
  });
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
  const doctorId = new mongoose.Types.ObjectId(req.query.id || req.user.id);
  validateMongodbId(doctorId);

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
  const { year } = req.params;
  const doctorObjectId = new mongoose.Types.ObjectId(req.user.id);
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
  const { year, month } = req.params;
  const doctorObjectId = new mongoose.Types.ObjectId(req.user.id);
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
