const asyncHandler = require('../middlewares/asyncHandler');
const Product = require('../models/product');

const checkExpiry = (Model, fieldName) =>
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const currentDate = new Date();

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let filterByStock = 'quantity';
    if (Model.modelName === 'Product') {
      filterByStock = 'stock';
    }

    // First, get all products with stock to filter by expiry logic
    const products = await Model.find({
      [filterByStock]: { $gt: 0 },
    });

    // Filter products that are expiring soon
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

    if (expiringSoon.length === 0) {
      return res.status(200).json({
        message: 'No items needing expiry notification',
        currentPage: pageNumber,
        totalPages: 0,
        results: 0,
        length: 0,
        expiringSoon: []
      });
    }

    // Apply pagination to the filtered results
    const totalDocs = expiringSoon.length;
    const totalPages = Math.ceil(totalDocs / limitNumber);
    const skip = (pageNumber - 1) * limitNumber;
    const paginatedResults = expiringSoon
      .sort((a, b) => new Date(a[fieldName]) - new Date(b[fieldName])) // Sort by expiry date
      .slice(skip, skip + limitNumber);

    res.status(200).json({
      status: 'success',
      currentPage: pageNumber,
      totalPages,
      results: totalDocs,
      length: paginatedResults.length,
      expiringSoon: paginatedResults,
    });
  });

module.exports = checkExpiry;
