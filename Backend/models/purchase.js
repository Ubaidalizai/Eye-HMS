<<<<<<< HEAD
const mongoose = require('mongoose');
const Product = require('../models/product');
const User = require('../models/userModel');
=======
const mongoose = require("mongoose");
>>>>>>> origin/master

const PurchaseSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
      ref: 'User',
=======
      ref: "users",
>>>>>>> origin/master
      required: true,
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
<<<<<<< HEAD
      ref: 'Product',
=======
      ref: "product",
>>>>>>> origin/master
      required: true,
    },
    QuantityPurchased: {
      type: Number,
      required: true,
    },
    PurchaseDate: {
      type: String,
      required: true,
    },
<<<<<<< HEAD
    UnitPurchaseAmount: {
      type: Number,
      required: true,
    },
    TotalPurchaseAmount: Number,
    category: {
      type: String,
      enum: ['drug', 'sunglasses'],
      required: true,
    },
=======
    TotalPurchaseAmount: {
      type: Number,
      required: true,
    },
>>>>>>> origin/master
  },
  { timestamps: true }
);

<<<<<<< HEAD
PurchaseSchema.pre('save', async function (next) {
  // Generate the total purchase amount
  this.TotalPurchaseAmount = this.UnitPurchaseAmount * this.QuantityPurchased;
  next();
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
=======
const Purchase = mongoose.model("purchase", PurchaseSchema);
>>>>>>> origin/master
module.exports = Purchase;
