const express = require('express');
const router = express.Router();
const product = require('../controllers/product');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

// Enable authentication middleware and admin authorization for all routes in this file
router.use(authenticate);

// Check for expired products
router.get('/product/expire', product.checkProductExpiry);

// Move Drugs From Inventory to pharmacy
router.post('/product/move', product.moveDrugsToPharmacy);

// Search Products
router.get('/product/search', product.searchProduct);

router.route('/product').get(product.getAllProducts).post(product.addProduct);

router
  .route('/product/:id')
  .patch(product.updateSelectedProduct)
  .delete(product.deleteSelectedProduct);

module.exports = router;
