const express = require('express');
const dashboardController = require('../controllers/dashboaredController');
const router = express.Router();

// Route to get dashboard summary
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;
