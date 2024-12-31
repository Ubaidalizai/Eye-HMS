const mongoose = require('mongoose');

const yeglizerSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    time: { type: String, required: true },
    date: { type: Date, required: true },
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

yeglizerSchema.pre('findOneAndDelete', async function (next) {
  const yeglizerId = this.getQuery()._id; // Get the ID being deleted

  // Delete related records in DoctorKhata
  await mongoose.model('DoctorKhata').deleteOne({
    branchNameId: yeglizerId,
    branchModel: 'yeglizerModel',
  });

  // Delete related records in Income
  await mongoose.model('Income').deleteOne({
    saleId: yeglizerId,
    saleModel: 'yeglizerModel',
  });

  next();
});

module.exports = mongoose.model('Yeglizer', yeglizerSchema);
