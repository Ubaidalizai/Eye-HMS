const Sales = require('../models/sales');
const Product = require('../models/product');
const asyncHandler = require('../middlewares/asyncHandler');
const appError = require('../utils/appError');

const soldStock = asyncHandler(async (productID, stockSoldData) => {
  // Updating sold stock
  const myProductData = await Product.findOne({ _id: productID });
  let myUpdatedStock = myProductData.stock - stockSoldData;
  if (myUpdatedStock < 0) {
    myUpdatedStock = 0;
  }
  const SoldStock = await Product.findByIdAndUpdate(
    { _id: productID },
    {
      stock: myUpdatedStock,
    },
    { new: true }
  );

  if (!SoldStock) {
    return next(new appError('The product not found, for updating stoke', 404));
  }
});

module.exports = soldStock;
