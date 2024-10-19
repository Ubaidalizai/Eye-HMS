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
    },
    description: String,
    category: {
      type: String,
      enum: ['drug', 'sunglasses', 'frame'],
      required: true,
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
