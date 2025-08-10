const express = require('express');
const router = express.Router();

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');
const {
  moveSalesTotalLog,
  getPharmacySalesTotal,
} = require('../controllers/pharmacySalesTotalCtrl');

router.use(authenticate, authorizeAdminOrPharmacist);

router.route('/').get(getPharmacySalesTotal).post(moveSalesTotalLog);

module.exports = router;
