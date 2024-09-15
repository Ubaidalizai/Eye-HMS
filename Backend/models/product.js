const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['drug', 'sunglasses'],
      required: true,
    },
    // batchNumber: {
    //   type: Number,
    //   required: true,
    // },
    // expiryDate: {
    //   type: Date,
    //   required: true,
    // },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
