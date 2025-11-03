const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/appError');
const validateMongoDBId = require('../utils/validateMongoDbId');

const getAll = (Model, userID = false, popOptions = null) =>
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      checkQuantity = false,
      category,
      searchTerm,
      fieldName,
      serialToday = false, // 👈 optional flag
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

    let finalResults = results;

    if (serialToday) {
      // find today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // fetch all today's records (_id + createdAt only, sorted by createdAt)
      const allTodaysDocs = await Model.find({
        ...query,
        date: { $gte: today, $lt: tomorrow },
      })
        .select('_id createdAt')
        .sort({ createdAt: 1 });

      // build map of serials
      const serialMap = new Map();
      allTodaysDocs.forEach((doc, idx) => {
        serialMap.set(doc._id.toString(), idx + 1); // serial starts at 1
      });

      // attach serials to current paginated results
      finalResults = results.map((doc) => {
        const serialNumber = serialMap.get(doc._id.toString());
        return {
          ...doc.toObject(),
          ...(serialNumber ? { serialNumber } : {}),
        };
      });
    }

    const response = formatResponse(finalResults, page, limit, totalDocuments);

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
