const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      required: [true, 'Category type is required'],
      enum: {
        values: ['expense', 'income'],
        message: 'Category type must be either expense or income'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for name and type (allows same name for different types)
categorySchema.index({ name: 1, type: 1 }, { unique: true });
categorySchema.index({ type: 1 });
categorySchema.index({ isActive: 1 });

// Pre-save middleware to normalize name
categorySchema.pre('save', function(next) {
  if (this.name) {
    this.name = this.name.toLowerCase().trim();
  }
  next();
});

// Static method to get active categories by type
categorySchema.statics.getActiveByType = function(type) {
  return this.find({ isActive: true, type }).sort({ name: 1 });
};

// Static method to get all active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ type: 1, name: 1 });
};

// Instance method to check if category is in use
categorySchema.methods.isInUse = async function() {
  try {
    // Only check Income and Expense models since this is for financial categories
    const Income = mongoose.model('Income');
    const Expense = mongoose.model('Expense');

    const [incomeCount, expenseCount] = await Promise.all([
      Income.countDocuments({ category: this.name }).catch(() => 0),
      Expense.countDocuments({ category: this.name }).catch(() => 0),
    ]);

    return incomeCount + expenseCount > 0;
  } catch (error) {
    return false;
  }
};

module.exports = mongoose.model('Category', categorySchema);
