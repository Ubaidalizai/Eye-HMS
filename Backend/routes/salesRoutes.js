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
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin, authorizePharmacist);

router.get('/totaleSalecategoties', authorizeAdmin, getSalesCategoryTotal);
// Get Sales Monthly Data
router.get('/:year/:month', authorizeAdmin, getOneMonthSales);
router.get('/:year', authorizeAdmin, getOneYearSales);
router.get(
  '/year-month/:year/:month',
  authorizeAdmin,
  getOneMonthSalesWithFullDetails
);
// Add Sales
router.route('/').get(authorizeAdmin, getAllSales).post(sellItems);

router.route('/:id').delete(deleteSale);

module.exports = router;
