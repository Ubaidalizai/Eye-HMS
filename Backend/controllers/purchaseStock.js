const Purchase = require('../models/purchase');
const Product = require('../models/product');
const asyncHandler = require('../middlewares/asyncHandler');

const purchaseStock = asyncHandler(
  async (productID, purchaseStockData, expiryDate) => {
    // Find the product by ID
    const product = await Product.findById(productID);

    if (!product) {
      throw new AppError('The product not found, unable to update stock.', 404);
    }

    // Update stock and expiry date
    product.stock += Number(purchaseStockData);
    product.expiryDate = expiryDate;

    // Save the updated product
    await product.save();
  }
);

module.exports = purchaseStock;
