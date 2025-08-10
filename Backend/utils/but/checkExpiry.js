const asyncHandler = require('../middlewares/asyncHandler');
const Product = require('../models/product');

const checkExpiry = (Model, fieldName) =>
  asyncHandler(async (req, res) => {
    const currentDate = new Date();

    let filterByStock = 'quantity';
    if (Model.modelName === 'Product') {
      filterByStock = 'stock';
    }

    const products = await Model.find({
      [filterByStock]: { $gt: 0 },
    });

    // ...existing code...
    const expiringSoon = products.filter((product) => {
      const rawDate = product[fieldName];
      if (!rawDate) return false;

      const expiryDate = new Date(rawDate);
      if (isNaN(expiryDate.getTime())) return false;

      const notifyDays = product.expireNotifyDuration || 0;

      // Notify if expiryDate is within the next notifyDays days
      const notifyThreshold = new Date(
        currentDate.getTime() + notifyDays * 24 * 60 * 60 * 1000
      );
      return expiryDate <= notifyThreshold && expiryDate >= currentDate;
    });
    // ...existing code...

    if (expiringSoon.length === 0) {
      return res
        .status(200)
        .json({ message: 'No items needing expiry notification' });
    }

    res.status(200).json({
      status: 'success',
      length: expiringSoon.length,
      expiringSoon,
    });
  });

module.exports = checkExpiry;
