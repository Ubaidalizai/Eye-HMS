const asyncHandler = require('../middlewares/asyncHandler');
const Product = require('../models/product');

const checkExpiry = (Model, fieldName) =>
  asyncHandler(async (req, res) => {
    const beforeThirtyDays = new Date();
    beforeThirtyDays.setDate(beforeThirtyDays.getDate() + 30);

    let filterByStock = 'quantity';
    if (Model.modelName === 'Product') {
      filterByStock = 'stock';
    }

    const expiredItems = await Model.find({
      [fieldName]: { $lte: beforeThirtyDays },
      [filterByStock]: { $gt: 0 },
    });

    if (expiredItems.length === 0) {
      return res.status(200).json({ message: 'No expired items found' });
    }

    res.status(200).json({
      status: 'success',
      length: expiredItems.length,
      data: { expiredItems },
    });
  });

module.exports = checkExpiry;
