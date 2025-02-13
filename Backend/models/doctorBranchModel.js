const mongoose = require('mongoose');

const doctorBranchSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    branchModel: {
      type: String,
      required: true,
      enum: [
        'bedroomModule',
        'octModule',
        'opdModule',
        'ultraSoundModule',
        'operationModule',
        'yeglizerModel',
        'labratoryModule',
      ],
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorBranchAssignment', doctorBranchSchema);
