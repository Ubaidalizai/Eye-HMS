const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    patientID: {
      type: String,
      unique: true,
      required: true,
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    insuranceContact: {
      type: String,
      required: true,
    },
    prescriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ], // Prescriptions will be added later
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
