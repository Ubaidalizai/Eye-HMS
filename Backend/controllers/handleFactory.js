const asyncHandler = require('../middlewares/asyncHandler');
const validateMongoDBId = require('../utils/validateMongoDBId');

const getAll = (Model, userID = false, popOptions = null) =>
  asyncHandler(async (req, res) => {
    const { page, limit, checkQuantity, category, searchTerm } = req.query;
    const query = {};
    if (userID) {
      const userID = req.user._id;
      validateMongoDBId(userID);
      query.userID = userID; // Add userID filter
    }
    if (checkQuantity) {
      query.stock = { stock: { $gt: 0 } };
      query.quantity = { quantity: { $gt: 0 } };
    }
    if (category && category.trim()) {
      query.category = category.trim(); // Add category filter
    }
    if (searchTerm && searchTerm.trim()) {
      // If searchTerm is provided, add an exact match filter
      query.name = { $regex: searchTerm, $options: 'i' }; // Exact match on 'name' field
    }

    try {
      let queryBuilder = Model.find(query).sort({ date: -1 }); // Sort by date

      if (popOptions) {
        console.log(popOptions);
        queryBuilder = queryBuilder.populate(popOptions); // Apply population if provided
      }

      if (page && limit) {
        const pageNumber = Math.max(parseInt(page, 10), 1); // Page number
        const limitNumber = Math.max(parseInt(limit, 10), 10); // Results per page
        queryBuilder = queryBuilder
          .skip((pageNumber - 1) * limitNumber) // Skip for pagination
          .limit(limitNumber); // Limit results
      }

      const results = await queryBuilder;
      const totalDocuments = await Model.countDocuments(query);

      const response = {
        status: 'success',
        results: results.length,
        data: { results },
      };

      if (page && limit) {
        const pageNumber = Math.max(parseInt(page, 10), 1);
        const limitNumber = Math.max(parseInt(limit, 10), 10);
        response.currentPage = pageNumber;
        response.totalPages = Math.ceil(totalDocuments / limitNumber);
      }

      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'An error occurred while fetching data',
      });
    }
  });

module.exports = getAll;
