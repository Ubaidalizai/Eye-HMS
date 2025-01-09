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
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/totaleSalecategoties', authorizeAdmin, getSalesCategoryTotal);
// Get Sales Monthly Data
router.get('/:year/:month', authorizeAdmin, getOneMonthSales);
router.get('/:year', authorizeAdmin, getOneYearSales);
router.get(
  '/year-month/:year/:month',
  authorize3Users,
  getOneMonthSalesWithFullDetails
);
// Add Sales
router
  .route('/')
  .get(authorize3Users, getAllSales)
  .post(authorize3Users, sellItems);

router.route('/:id').delete(authorize3Users, deleteSale);

module.exports = router;
