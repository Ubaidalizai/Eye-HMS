const mongoose = require('mongoose');

const bedroomSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  time: { type: String, required: true },
  date: { type: Date, required: true },
  rent: { type: Number, required: true, min: 0 },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  percentage: { type: Number, default: 0, min: 0, max: 100 },
  discount: { type: Number, required: true, default: 0, min: 0, max: 100 },
  totalAmount: { type: Number, required: true },
});

// Pre-hook for cascade delete
bedroomSchema.pre('findOneAndDelete', async function (next) {
  const bedroomId = this.getQuery()._id; // Get the ID being deleted

  // Delete related records in DoctorKhata
  await mongoose.model('DoctorKhata').deleteOne({
    branchNameId: bedroomId,
    branchModel: 'bedroomModule',
  });

  // Delete related records in Income
  await mongoose.model('Income').deleteOne({
    saleId: bedroomId,
    saleModel: 'bedroomModule',
  });

  next();
});

const Bedroom = mongoose.model('Bedroom', bedroomSchema);

module.exports = Bedroom;
