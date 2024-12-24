const DoctorKhata = require('../models/doctorKhataModel');
const User = require('../models/userModel');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');

exports.createDoctorKhata = asyncHandler(async (req, res) => {
  const { doctorId, amount, description, amountType, date } = req.body;

  if (!doctorId || !amount || !amountType || !date) {
    throw new AppError('All fields are required', 400);
  }

  // Check if doctor exists in User model and has percentage
  const doctor = await User.findById(doctorId);
  if (!doctor || !doctor.percentage) {
    throw new AppError('Doctor not found or does not have percentage', 400);
  }

  const doctorKhata = new DoctorKhata({
    doctorId,
    amount,
    description,
    amountType,
    date,
  });
  await doctorKhata.save();

  res.status(201).json({ message: 'Record created successfully' });
});

exports.getDoctorKhataById = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  // Check if doctor exists in User model and has percentage
  const doctor = await User.findById(doctorId);
  if (!doctor || !doctor.percentage) {
    throw new AppError('Doctor not found or does not have percentage', 400);
  }

  const doctorKhata = await DoctorKhata.find({ doctorId });

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
