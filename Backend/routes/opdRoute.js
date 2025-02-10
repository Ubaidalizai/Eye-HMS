const express = require('express');
const {
  getOpdDataByYear,
  getOpdDataByMonth,
  getAllRecords,
  addRecord,
  getRecordByPatientId,
  updateRecordByPatientId,
  deleteRecordByPatientId,
  fetchRecordsByPatientId,
  getOpdDoctors,
} = require('../controllers/opdController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/opd-doctors', getOpdDoctors);

router.get('/:year', getOpdDataByYear);
router.get('/:year/:month', getOpdDataByMonth);

router.route('/').get(getAllRecords).post(addRecord);

router
  .route('/:id')
  .get(getRecordByPatientId)
  .patch(updateRecordByPatientId)
  .delete(deleteRecordByPatientId);

module.exports = router;
