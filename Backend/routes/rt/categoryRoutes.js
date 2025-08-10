const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Public routes (for dropdowns, etc.)
router.get('/active', categoryController.getActiveCategories);

// Protected routes
router.use(authenticate, authorizeAdmin);

// CRUD routes - Order matters! Specific routes before generic /:id
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);
router.get('/:id', categoryController.getCategoryById);

module.exports = router;
