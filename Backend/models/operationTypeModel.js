const mongoose = require('mongoose');

const operationTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['operation', 'oct', 'biscayne'],
      default: 'operation',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OperationType', operationTypeSchema);
