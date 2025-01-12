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
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/totaleSalecategoties', authorizeAdmin, getSalesCategoryTotal);
// Get Sales Monthly Data
router.get('/:year/:month', authorizeAdmin, getOneMonthSales);
router.get('/:year', authorizeAdmin, getOneYearSales);
router.get(
  '/year-month/:year/:month',
  authorizeAdminOrPharmacist,
  getOneMonthSalesWithFullDetails
);
// Add Sales
router
  .route('/')
  .get(authorizeAdminOrPharmacist, getAllSales)
  .post(authorizeAdminOrPharmacist, sellItems);

router.route('/:id').delete(authorizeAdminOrPharmacist, deleteSale);

module.exports = router;
