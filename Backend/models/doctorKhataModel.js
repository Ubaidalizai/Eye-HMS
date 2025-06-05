const mongoose = require('mongoose');

const doctorKhataSchema = new mongoose.Schema(
  {
    branchNameId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Ensure saleId is always provided
      refPath: 'saleModel', // Dynamic reference based on 'saleModel'
    },
    branchModel: {
      type: String,
      required: true,
      enum: [
        'DoctorKhata',
        'octModule',
        'opdModule',
        'labratoryModule',
        'bedroomModule',
        'ultraSoundModule',
        'operationModule',
        'yeglizerModel',
        'glassModel',
        'perimetryModel',
        'FAModel',
        'PRPModel',
      ], // Allowed models
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountType: {
      type: String,
      enum: ['income', 'outcome'],
      required: [true, 'A doctor must have a money type (income or outcome)'],
    },
    amount: {
      type: Number,
      required: [true, 'A doctor must have an amount'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const DoctorKhata = mongoose.model('DoctorKhata', doctorKhataSchema);
module.exports = DoctorKhata;
