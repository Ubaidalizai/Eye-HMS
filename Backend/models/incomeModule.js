const mongoose = require('mongoose');

// Define the Income schema
const incomeSchema = new mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Ensure saleId is always provided
      refPath: 'saleModel', // Dynamic reference based on 'saleModel'
    },
    saleModel: {
      type: String, // Stores the referenced model name (e.g., 'Sale', 'FrameSale')
      required: true, // Must specify the model name for dynamic referencing
      enum: [
        'octModule',
        'opdModule',
        'labratoryModule',
        'bedroomModule',
        'ultraSoundModule',
        'operationModule',
        'yeglizerModel',
        'salesModel',
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
      min: 0,
    },
    category: {
      type: String,
      enum: [
        'drug',
        'sunglasses',
        'glass',
        'frame',
        'oct',
        'opd',
        'laboratory',
        'bedroom',
        'ultrasound',
        'operation',
        'yeglizer',
      ],
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
