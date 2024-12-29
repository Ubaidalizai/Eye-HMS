const mongoose = require('mongoose');

const opdSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  totalAmount: { type: Number, required: true, min: 0 },
});

opdSchema.pre('findOneAndDelete', async function (next) {
  const opdId = this.getQuery()._id; // Get the ID being deleted

  // Delete related records in DoctorKhata
  await mongoose.model('DoctorKhata').deleteOne({
    branchNameId: opdId,
    branchModel: 'opdModule',
  });

  // Delete related records in Income
  await mongoose.model('Income').deleteOne({
    saleId: opdId,
    saleModel: 'opdModule',
  });

  next();
});

const OPD = mongoose.model('OPD', opdSchema);

module.exports = OPD;
