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
      ref: 'Product',
      required: true,
    },
    QuantityPurchased: {
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
    salePrice: {
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
          return value > new Date();
        },
        message: 'Expiry date must be in the future',
      },
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model('Purchase', PurchaseSchema);
module.exports = Purchase;
