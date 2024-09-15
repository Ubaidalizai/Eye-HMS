const express = require('express');
const router = express.Router();
const product = require('../controllers/product');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

// Enable authentication middleware and admin authorization for all routes in this file
router.use(authenticate);
// Move Drugs From Inventory to pharmacy
router.post('/product/move', product.moveDrugsToPharmacy);
// Search Products
router.get('/product/search', product.searchProduct);

router.route('/product/').get(product.getAllProducts).post(product.addProduct);

router
  .route('/product/:id')
  .patch(product.updateSelectedProduct)
  .delete(product.deleteSelectedProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

module.exports = router;
