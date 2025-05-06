const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'productModel', // dynamically resolved
    },
    productModel: {
      type: String,
      required: true,
      enum: ['Product', 'Glass'], // model names
    },
    QuantityPurchased: {
      type: Number,
      required: true,
    },
    originalQuantity: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    UnitPurchaseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    TotalPurchaseAmount: Number,
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'glass', 'frame'],
      required: true,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (this.category !== 'drug') return true; // skip validation
          return value instanceof Date && value > new Date(); // only validate for drugs
        },
        message: 'Expiry date must be a future date for drugs only',
      },
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model('Purchase', PurchaseSchema);
module.exports = Purchase;
