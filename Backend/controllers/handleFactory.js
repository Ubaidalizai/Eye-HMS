const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDBId');

const getAll = (Model, userID = false, popOptions = null) =>
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      checkQuantity = false,
      category,
      searchTerm,
      fieldName,
    } = req.query;
    if (!Model) {
      throw new AppError('Model is required', 500);
    }

    const query = buildQuery(
      req,
      userID,
      checkQuantity,
      category,
      searchTerm,
      fieldName
    );
    const queryBuilder = buildQueryBuilder(
      Model,
      query,
      popOptions,
      page,
      limit
    );

    const [results, totalDocuments] = await Promise.all([
      queryBuilder,
      Model.countDocuments(query),
    ]);

    const response = formatResponse(results, page, limit, totalDocuments);

    res.status(200).json(response);
  });

function buildQuery(
  req,
  userID,
  checkQuantity,
  category,
  searchTerm,
  fieldName
) {
  const query = {};

  if (userID) {
    const userId = req.user._id;
    validateMongoDBId(userId);
    query.userID = userId;
  }

  if (checkQuantity) {
    query.quantity = { $gte: 1 };
  }

  if (category && category.trim()) {
    const categories = category.split(',').map((cat) => cat.trim());
    query.category = { $in: categories };
  }

  if (searchTerm && searchTerm.trim() && fieldName && fieldName.trim()) {
    if (fieldName === 'date') {
      const searchDate = new Date(searchTerm);
      if (isNaN(searchDate)) {
        throw new AppError('Invalid date format', 400);
      }
      query[fieldName] = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    } else {
      query[fieldName] = { $regex: searchTerm, $options: 'i' };
    }
  }

  return query;
}

function buildQueryBuilder(Model, query, popOptions, page, limit) {
  let queryBuilder = Model.find(query).sort({ createdAt: -1 });

  if (popOptions) {
    queryBuilder = queryBuilder.populate(popOptions);
  }

  const pageNumber = Math.max(parseInt(page, 10), 1);
  const limitNumber = Math.max(parseInt(limit, 10), 10);

  return queryBuilder.skip((pageNumber - 1) * limitNumber).limit(limitNumber);
}

function formatResponse(results, page, limit, totalDocuments) {
  const pageNumber = Math.max(parseInt(page, 10), 1);
  const limitNumber = Math.max(parseInt(limit, 10), 10);

  return {
    status: 'success',
    results: results.length,
    data: { results },
    currentPage: pageNumber,
    totalPages: Math.ceil(totalDocuments / limitNumber),
  };
}

module.exports = getAll;
