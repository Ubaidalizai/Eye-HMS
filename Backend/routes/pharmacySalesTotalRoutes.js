const express = require('express');
const router = express.Router();

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');
const {
  moveSalesTotalLog,
  getPharmacySalesTotal,
} = require('../controllers/pharmacySalesTotalCtrl');

router.use(authenticate, authorize3Users);

router.route('/').get(getPharmacySalesTotal).post(moveSalesTotalLog);

module.exports = router;
