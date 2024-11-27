// routes/laboratoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordByPatientId,
  deleteLabRecordByPatientId,
} = require('../controllers/labratoryController');

// Define routes
router.route('/').post(createLabRecord).get(getAllLabRecords); // Create a new lab record

router
  .route('/:patientId')
  .get(getLabRecordByPatientId)
  .patch(updateLabRecordByPatientId)
  .delete(deleteLabRecordByPatientId); // Get a specific lab record by patientId

module.exports = router;
