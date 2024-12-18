const express = require('express');
const backupController = require('../controllers/backupController');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Route to trigger database backup
router.get(
  '/download',
  authenticate,
  authorizeAdmin,
  backupController.backupDatabase
);

module.exports = router;
