const express = require('express');
const backupController = require('../controllers/backupController');
const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin, authorizePharmacist);

// Route to trigger database backup
router.get('/download', authenticate, backupController.backupDatabase);

module.exports = router;
