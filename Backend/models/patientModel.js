const mongoose = require('mongoose');
const Prescription = require('./PrescriptionModule');
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contact: {
      type: String,
<<<<<<< HEAD
    
=======
>>>>>>> upstream/main
    },
    patientID: {
      type: String,
      unique: true,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    patientGender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    insuranceContact: String,
  },
  { timestamps: true }
);

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
