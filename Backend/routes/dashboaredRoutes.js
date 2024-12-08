const express = require('express');
const dashboardController = require('../controllers/dashboaredController');

const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to get dashboard summary
router.get(
  '/summary',
  authenticate,
  authorizeAdmin,
  dashboardController.getDashboardSummary
);

module.exports = router;
