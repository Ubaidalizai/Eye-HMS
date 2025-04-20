const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
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
      min: 0,
    },
    minLevel:{
      type: Number,
      required: [true, 'Pharmacy product must have a minimum level'],
      min: 0,
    },
    expireNotifyDuration: {
      type: Number,
      required: [true, 'Pharmacy product must have an expiry notify duration'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'glass', 'frame'],
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Make expiryDate required only for drugs
          return this.category === 'drug' ? !!value : true;
        },
        message: 'Expiry date is required for drugs.',
      },
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;
