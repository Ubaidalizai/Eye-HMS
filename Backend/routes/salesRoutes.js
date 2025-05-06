const express = require('express');

const router = express.Router();
const {
  sellItems,
  getAllSales,
  getOneYearSales,
  getOneMonthSales,
  getOneMonthSalesWithFullDetails,
  deleteSale,
  getSalesCategoryTotal,
} = require('../controllers/salesController');
const {
  authenticate,
  authorizeAdminOrReceptionist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrReceptionist);

router.get('/totaleSalecategoties', getSalesCategoryTotal);
// Get Sales Monthly Data
router.get('/:year/:month', getOneMonthSales);
router.get('/:year', getOneYearSales);
router.get('/year-month/:year/:month', getOneMonthSalesWithFullDetails);
// Add Sales
router.route('/').get(getAllSales).post(sellItems);

router.route('/:id').delete(deleteSale);

module.exports = router;
