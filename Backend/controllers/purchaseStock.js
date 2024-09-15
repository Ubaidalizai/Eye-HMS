const Purchase = require('../models/purchase');
const Product = require('../models/product');
const asyncHandler = require('../middlewares/asyncHandler');

const purchaseStock = asyncHandler( async (productID, purchaseStockData) => {
  // Updating Purchase stock
  try {
    const myProductData = await Product.findOne({ _id: productID });
    let myUpdatedStock = parseInt(myProductData.stock) + purchaseStockData;

    const PurchaseStock = await Product.findByIdAndUpdate(
      { _id: productID },
      {
        stock: myUpdatedStock,
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating Purchase stock ', error);
  }
});

module.exports = purchaseStock;
