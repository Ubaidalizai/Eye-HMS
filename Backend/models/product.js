const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
<<<<<<< HEAD
=======
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
>>>>>>> origin/master
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
<<<<<<< HEAD
    category: {
      type: String,
      enum: ['drug', 'sunglasses'],
      required: true,
    },
=======
>>>>>>> origin/master
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

<<<<<<< HEAD
const Product = mongoose.model('Product', ProductSchema);
=======
const Product = mongoose.model('product', ProductSchema);
>>>>>>> origin/master
module.exports = Product;
