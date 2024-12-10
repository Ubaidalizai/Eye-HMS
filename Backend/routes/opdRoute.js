const express = require('express');
const {
  getAllRecords,
  addRecord,
  getRecordByPatientId,
  updateRecordByPatientId,
  deleteRecordByPatientId,
} = require('../controllers/opdController');

const router = express.Router();

router.route('/').get(getAllRecords).post(addRecord);

router
  .route('/:patientId')
  .get(getRecordByPatientId)
  .patch(updateRecordByPatientId)
  .delete(deleteRecordByPatientId);

module.exports = router;
