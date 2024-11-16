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
      query[fieldName] = { $regex: searchTerm, $options: 'i' };
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
