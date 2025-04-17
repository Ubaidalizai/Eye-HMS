const express = require('express');
const router = express.Router();
const product = require('../controllers/product');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

// Enable authentication middleware and admin authorization for all routes in this file
router.use(authenticate, authorizeAdmin);

// Check for expired products
router.get('/product/expire', product.checkProductExpiry);
router.get('/product/expire/:months', product.giveProductExpireByMonth);


// Route to get inventory summary
router.get('/product/summary', product.getInventorySummary);

// Search Products
router.get('/product/search', product.searchProduct);

router.route('/product').get(product.getAllProducts).post(product.addProduct);

router
  .route('/product/:id')
  .patch(product.updateSelectedProduct)
  .delete(product.deleteSelectedProduct);

module.exports = router;
