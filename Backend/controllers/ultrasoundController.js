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
const addRecord = asyncHandler(async (req, res) => {
  const { patientId, doctor } = req.body;

  const patient = await Patient.findOne({ patientID: patientId });
  if (!patient) {
    throw new AppError('Patient not exist', 404);
  }

  const doctorExist = await User.findById(doctor);
  if (!doctorExist || doctorExist.role !== 'doctor') {
    throw new AppError('Doctor not exist', 404);
  }

  req.body.totalAmount = req.body.price;
  let doctorPercentage = 0;

  if (doctorExist.percentage) {
    // Calculate percentage and update total amount
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
  await ultrasound.save();

  // Create a new record if it doesn't exist
  await DoctorKhata.create({
    branchNameId: ultrasound._id,
    branchModel: 'ultraSoundModule',
    doctorId: doctorExist._id,
    amount: doctorPercentage,
    date: req.body.date,
    amountType: 'income',
  });

  if (ultrasound.totalAmount > 0) {
    await Income.create({
      saleId: ultrasound._id,
      saleModel: 'ultraSoundModule',
      date: ultrasound.date,
      totalNetIncome: ultrasound.totalAmount,
      category: 'ultrasound',
      description: 'ultrasound income',
    });
  }
  res.status(201).json({
    success: true,
    message: 'Ultrasound added successfully',
  });
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
const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDBId(id);
  const deletedRecord = await Ultrasound.findByIdAndDelete(id);

  if (!deletedRecord) {
    throw new AppError('Record not found', 404);
  }

  res.status(200).json({ message: 'Record deleted successfully' });
});

module.exports = {
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
