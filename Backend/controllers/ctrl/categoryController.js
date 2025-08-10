const asyncHandler = require('../middlewares/asyncHandler');
const Category = require('../models/categoryModel');
const AppError = require('../utils/appError');

// Create Category
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    throw new AppError('Name and type are required', 400);
  }

  // Check for existing category with same name and type
  const existingCategory = await Category.findOne({
    name: name.toLowerCase().trim(),
    type: type
  });
  if (existingCategory) {
    throw new AppError(`Category '${name}' already exists for type '${type}'`, 400);
  }

  const category = new Category({ name, type });
  await category.save();
  res.status(201).json({
    success: true,
    data: category,
    message: 'Category created successfully'
  });
});

// Get All Categories (with optional type filtering)
exports.getCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  console.log(req.query);
  const pageNumber = Math.max(parseInt(page, 10), 1);
  const limitNumber = Math.max(parseInt(limit, 10), 10);

  // Build query object
  const query = { isActive: true };

  // Add type filter if specified
  if (type && ['expense', 'income'].includes(type)) {
    query.type = type;
  }

  try {
    const [categories, totalDocuments] = await Promise.all([
      Category.find(query)
        .sort({ type: 1, name: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber),
      Category.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { results: categories },
      currentPage: pageNumber,
      totalPages: Math.ceil(totalDocuments / limitNumber),
    });
  } catch (error) {
    throw new AppError('Failed to fetch categories', 500);
  }
});

// Get Active Categories Only
exports.getActiveCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getActiveCategories();
  res.json({
    success: true,
    data: { results: categories },
    results: categories.length
  });
});

// Get Single Category
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
});

// Update Category
exports.updateCategory = asyncHandler(async (req, res) => {
  const { name, type, isActive } = req.body;

  // Check for duplicate name and type combination (excluding current category)
  if (name && type) {
    const existingCategory = await Category.findOne({
      name: name.toLowerCase().trim(),
      type: type,
      _id: { $ne: req.params.id }
    });
    if (existingCategory) {
      throw new AppError(`Category '${name}' already exists for type '${type}'`, 400);
    }
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (isActive !== undefined) updateData.isActive = isActive;

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  if (!category) throw new AppError('Category not found', 404);
  res.json({
    success: true,
    data: category,
    message: 'Category updated successfully'
  });
});

// Delete Category (with dependency check)
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);

  // Check if category is in use
  const isInUse = await category.isInUse();
  if (isInUse) {
    throw new AppError(
      'Cannot delete category as it is being used by income or expense records. Please remove all references first.',
      400
    );
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
