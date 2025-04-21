const asyncHandler = require('../middlewares/asyncHandler');
const Product = require('../models/product');

const checkExpiry = (Model, fieldName) =>
  asyncHandler(async (req, res) => {
    const currentDate = new Date();

    let filterByStock = 'quantity';
    if (Model.modelName === 'Product') {
      filterByStock = 'stock';
    }

    // Fetch all products with stock > 0
    const products = await Model.find({
      [filterByStock]: { $gt: 0 },
    });

    // Filter products that will expire within their notify duration
    const expiringSoon = products.filter((product) => {
      const expiryDate = new Date(product[fieldName]);
      const notifyDays = product.expireNotifyDuration || 0;

      const notifyThreshold = new Date(
        currentDate.getTime() + notifyDays * 24 * 60 * 60 * 1000
      );
      return expiryDate <= notifyThreshold;
    });

    if (expiringSoon.length === 0) {
      return res.status(200).json({ message: 'No items nearing expiry' });
    }

    res.status(200).json({
      status: 'success',
      length: expiringSoon.length,
      expiringSoon,
    });
  });

module.exports = checkExpiry;
