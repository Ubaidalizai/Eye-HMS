const Purchase = require('../models/purchase');
const Product = require('../models/product');
<<<<<<< HEAD
const asyncHandler = require('../middlewares/asyncHandler');

const purchaseStock = asyncHandler(async (productID, purchaseStockData) => {
  // Updating Purchase stock
  try {
    const product = await Product.findById({ _id: productID });
    if (!product) {
      res.status(404);
      throw new Error('The product not found, for updating stoke');
    }
    product.stock += Number(purchaseStockData);
    await product.save();
  } catch (error) {
    console.error('Error updating Purchase stock ', error);
  }
});
=======

const purchaseStock = async (productID, purchaseStockData) => {
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
};
>>>>>>> origin/master

module.exports = purchaseStock;
