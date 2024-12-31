// models/Laboratory.js
const mongoose = require('mongoose');

const laboratorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Pre-hook for cascade delete
laboratorySchema.pre('findOneAndDelete', async function (next) {
  const laboratoryId = this.getQuery()._id; // Get the ID being deleted

  // Delete related records in DoctorKhata
  await mongoose.model('DoctorKhata').deleteOne({
    branchNameId: laboratoryId,
    branchModel: 'labratoryModule',
  });

  // Delete related records in Income
  await mongoose.model('Income').deleteOne({
    saleId: laboratoryId,
    saleModel: 'labratoryModule',
  });

  next();
});

const Laboratory = mongoose.model('Laboratory', laboratorySchema);

module.exports = Laboratory;
