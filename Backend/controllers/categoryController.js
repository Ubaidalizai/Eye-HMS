const asyncHandler = require('../middlewares/asyncHandler');
const Category = require('../models/categoryModel');
const AppError = require('../utils/appError');

// Create Category
exports.createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    throw new AppError('Category already exists', 400);
  }
  const category = new Category({ name });
  await category.save();
  res.status(201).json({ success: true, data: category });
});

// Get All Categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, data: categories });
});

// Get Single Category
exports.getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
});

// Update Category
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true, runValidators: true }
  );
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, data: category });
});

// Delete Category
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  res.json({ success: true, message: 'Category deleted successfully' });
});
