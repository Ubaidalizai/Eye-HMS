const express = require('express');
const {
  createPharmacyLog,
  getAllPharmacyLogs,
  getPharmacyLogById,
  updatePharmacyLog,
  deletePharmacyLog,
} = require('../controllers/pharmacyLogController');

const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.route('/').get(getAllPharmacyLogs).post(createPharmacyLog);

router
  .route('/:id')
  .get(getPharmacyLogById)
  .put(updatePharmacyLog)
  .delete(deletePharmacyLog);

module.exports = router;
