const express = require('express');
const app = express();

const router = express.Router();
const {
  sellItems,
  getAllSales,
  getOneYearSales,
  getOneMonthSales,
  getOneMonthSalesWithFullDetails,
  updateSale,
} = require('../controllers/salesController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate); // Enable authentication middleware for all routes in this file

// Get Sales Monthly Data
router.get('/:year/:month', getOneMonthSales);
router.get('/:year', getOneYearSales);
router.get('/year-month/:year/:month', getOneMonthSalesWithFullDetails);
// Add Sales
router.route('/').get(getAllSales).post(sellItems);

router.route('/:id').patch(updateSale);

module.exports = router;
