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
} = require('../controllers/ultrasoundController');

const router = express.Router();

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrPharmacist);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/:year', getUltrasoundDataByYear);
router.get('/:year/:month', getUltrasoundDataByMonth);

router.route('/').post(addRecord).get(getAllRecords); // Get all records

router
  .route('/:id')
  .get(getRecordById)
  .patch(updateRecord)
  .delete(deleteRecord);

module.exports = router;
