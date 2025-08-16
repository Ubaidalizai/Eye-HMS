const express = require('express');
const router = express.Router();
const {
  getDailySummary,
  getDailySummaries
} = require('../controllers/dailySummaryController');

const {
  authenticate,
  authorizeAdmin
} = require('../middlewares/authMiddleware');

// Apply authentication and authorization middleware
router.use(authenticate, authorizeAdmin);

// Get single day summary
// GET /api/v1/daily-summary?date=2024-01-15
router.get('/', getDailySummary);

// Get multiple days summary
// GET /api/v1/daily-summary/range?startDate=2024-01-15&endDate=2024-01-20
router.get('/range', getDailySummaries);

module.exports = router;
