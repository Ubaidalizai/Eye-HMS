const mongoose = require('mongoose');

const operationTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Operation type name is required'],
      unique: true,
      trim: true,
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
