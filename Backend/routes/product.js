const express = require('express');
<<<<<<< HEAD
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

router.route('/product').get(product.getAllProducts).post(product.addProduct);

router
  .route('/product/:id')
  .patch(product.updateSelectedProduct)
  .delete(product.deleteSelectedProduct);

module.exports = router;
=======
const app = express();
const product = require('../controllers/product');
const { authenticate } = require('../middlewares/authMiddleware');

// Move Drugs From Inventory to pharmacy
app.post('/move', authenticate, product.moveDrugsToPharmacy);

// Add Product
app.post('/add', product.addProduct);

// Get All Products
app.get('/get/:userId', product.getAllProducts);

// Delete Selected Product Item
app.get('/delete/:id', product.deleteSelectedProduct);

// Update Selected Product
app.post('/update', product.updateSelectedProduct);

// Search Product
app.get('/search', product.searchProduct);

// http://localhost:4000/api/product/search?searchTerm=fa

module.exports = app;
>>>>>>> origin/master
