const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'saleModel', // Dynamic reference based on 'saleModel'
    },
    saleModel: {
      type: String,
      required: true,
      enum: [
        'userModel',
        'octModule',
        'opdModule',
        'labratoryModule',
        'bedroomModule',
        'ultraSoundModule',
        'operationModule',
        'yeglizerModel',
        'salesModel',
        'pharmacyModel',
        'glassModel',
        'perimetryModel',
        'FAModel',
        'PRPModel',
      ], // Allowed models
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalNetIncome: {
      type: Number,
      required: [true, 'An income must have a total net income'],
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
