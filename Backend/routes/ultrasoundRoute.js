const express = require('express');
const {
  getUltrasoundDataByYear,
  getUltrasoundDataByMonth,
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  fetchRecordsByPatientId,
  getUltrasoundDoctors,
} = require('../controllers/ultrasoundController');

const router = express.Router();

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/ultrasound-doctors', getUltrasoundDoctors);

router.get('/:year', getUltrasoundDataByYear);
router.get('/:year/:month', getUltrasoundDataByMonth);

router.route('/').post(addRecord).get(getAllRecords); // Get all records

router
  .route('/:id')
  .get(getRecordById)
  .patch(updateRecord)
  .delete(deleteRecord);

module.exports = router;
