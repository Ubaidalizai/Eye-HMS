const asyncHandler = require('../middlewares/asyncHandler');

const checkExpiry = (Model, fieldName) =>
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, q } = req.query;
    const currentDate = new Date();

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let filterByStock = 'quantity';
    if (Model.modelName === 'Product') {
      filterByStock = 'stock';
    }

    // Build DB query: limit to items with stock > 0 and optionally by name
    const dbQuery = { [filterByStock]: { $gt: 0 } };
    if (q && q.trim() !== '') {
      dbQuery.name = { $regex: q.trim(), $options: 'i' };
    }

    // Fetch matching products from DB (filtered by name when q provided)
    const products = await Model.find(dbQuery);

    // Filter products that are expiring soon OR already expired
    const expiringSoon = products.filter((product) => {
      const rawDate = product[fieldName];
      if (!rawDate) return false;

      const expiryDate = new Date(rawDate);
      if (isNaN(expiryDate.getTime())) return false;

      const notifyDays = product.expireNotifyDuration || 0;

      // Check if product is already expired
      if (expiryDate < currentDate) {
        return true; // Include already expired products
      }

      // Check if product is expiring within the notify duration
      const notifyThreshold = new Date(
        currentDate.getTime() + notifyDays * 24 * 60 * 60 * 1000
      );
      return expiryDate <= notifyThreshold;
    });

    if (expiringSoon.length === 0) {
      return res.status(200).json({
        message: 'No expired or expiring items found',
        currentPage: pageNumber,
        totalPages: 0,
        results: 0,
        length: 0,
        expiringSoon: []
      });
    }

    // Categorize products into expired and expiring
    const categorizedProducts = expiringSoon.map(product => {
      const expiryDate = new Date(product[fieldName]);
      const isExpired = expiryDate < currentDate;
      const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

      return {
        ...product.toObject(),
        isExpired,
        daysUntilExpiry,
        expiryStatus: isExpired ? 'expired' : 'expiring'
      };
    });

    // Sort: expired products first (by how long expired), then expiring products (by expiry date)
    const sortedProducts = categorizedProducts.sort((a, b) => {
      // If both are expired, sort by expiry date (most recently expired first)
      if (a.isExpired && b.isExpired) {
        return new Date(b[fieldName]) - new Date(a[fieldName]);
      }
      // If both are expiring, sort by expiry date (soonest first)
      if (!a.isExpired && !b.isExpired) {
        return new Date(a[fieldName]) - new Date(b[fieldName]);
      }
      // Expired products come first
      return a.isExpired ? -1 : 1;
    });

    // Apply pagination to the sorted results
    const totalDocs = sortedProducts.length;
    const totalPages = Math.ceil(totalDocs / limitNumber);
    const skip = (pageNumber - 1) * limitNumber;
    const paginatedResults = sortedProducts.slice(skip, skip + limitNumber);

    // Count expired vs expiring
    const expiredCount = sortedProducts.filter(p => p.isExpired).length;
    const expiringCount = sortedProducts.filter(p => !p.isExpired).length;

    res.status(200).json({
      status: 'success',
      currentPage: pageNumber,
      totalPages,
      results: totalDocs,
      length: paginatedResults.length,
      summary: {
        total: totalDocs,
        expired: expiredCount,
        expiring: expiringCount
      },
      expiringSoon: paginatedResults,
    });
  });

module.exports = checkExpiry;
