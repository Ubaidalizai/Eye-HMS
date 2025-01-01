const express = require('express');
const {
  getOpdDataByYear,
  getOpdDataByMonth,
  getAllRecords,
  addRecord,
  getRecordByPatientId,
  updateRecordByPatientId,
  deleteRecordByPatientId,
} = require('../controllers/opdController');

const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin, authorizePharmacist);

router.get('/:year', getOpdDataByYear);
router.get('/:year/:month', getOpdDataByMonth);

router.route('/').get(getAllRecords).post(addRecord);

router
  .route('/:id')
  .get(getRecordByPatientId)
  .patch(updateRecordByPatientId)
  .delete(deleteRecordByPatientId);

module.exports = router;
