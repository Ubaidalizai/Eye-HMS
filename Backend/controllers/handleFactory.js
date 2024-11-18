const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDBId');

const getAll = (Model, userID = false, popOptions = null) =>
  asyncHandler(async (req, res, next) => {
    const { page, limit, checkQuantity, category, searchTerm, fieldName } =
      req.query;
    const query = {};

    if (userID) {
      const userID = req.user._id;
      validateMongoDBId(userID);
      query.userID = userID; // Add userID filter
    }

    if (checkQuantity) {
      query.quantity = { $gte: 1 };
    }

    if (category && category.trim()) {
      const categories = category.split(',').map((cat) => cat.trim());
      query.category = { $in: categories };
    }
    console.log(req.query);
    if (searchTerm && searchTerm.trim() && fieldName && fieldName.trim()) {
      if (fieldName === 'date') {
        // If the field is a date, parse the search term to a Date object and match
        const searchDate = new Date(searchTerm);
        if (!isNaN(searchDate)) {
          query[fieldName] = {
            $gte: new Date(searchDate.setHours(0, 0, 0, 0)), // Start of the day
            $lt: new Date(searchDate.setHours(23, 59, 59, 999)), // End of the day
          };
        } else {
          return next(new AppError('Invalid date format', 400));
        }
      } else {
        // For other fields, apply regex
        query[fieldName] = { $regex: searchTerm, $options: 'i' };
      }
    }

    let queryBuilder = Model.find(query).sort({ createdAt: -1 });

    if (popOptions) {
      queryBuilder = queryBuilder.populate(popOptions);
    }

    const pageNumber = page ? Math.max(parseInt(page, 10), 1) : 1;
    const limitNumber = limit ? Math.max(parseInt(limit, 10), 10) : 10;

    if (page && limit) {
      queryBuilder = queryBuilder
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    }

    const results = await queryBuilder;
    const totalDocuments = await Model.countDocuments(query);

    const response = {
      status: 'success',
      results: results.length,
      data: { results },
      currentPage: pageNumber,
      totalPages: Math.ceil(totalDocuments / limitNumber),
    };

    res.status(200).json(response);
  });

module.exports = getAll;
