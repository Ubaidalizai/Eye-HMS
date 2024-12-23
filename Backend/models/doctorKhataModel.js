const mongoose = require('mongoose');

const doctorKhataSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    income: {
      type: Number,
      required: [true, 'A doctor must have an income'],
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
