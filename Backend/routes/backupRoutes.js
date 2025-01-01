const express = require('express');
const backupController = require('../controllers/backupController');
const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdminOrPharmacist);

// Route to trigger database backup
router.get('/download', backupController.backupDatabase);

module.exports = router;
