const express = require('express');
const app = express();

const router = express.Router();
const {
  sellItems,
  getAllSales,
  getOneMonthSales,
  getMonthlySales,
} = require('../controllers/salesController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate); // Enable authentication middleware for all routes in this file

// Get Sales Monthly Data
router.get('/one-month-sales/:year/:month', getOneMonthSales);
router.get('/monthly-sales/', getMonthlySales);

// Add Sales
router.route('/').get(getAllSales).post(sellItems);

module.exports = router;
