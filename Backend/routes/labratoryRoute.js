// routes/laboratoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
} = require('../controllers/labratoryController');

// Define routes
router.route('/').post(createLabRecord).get(getAllLabRecords); // Create a new lab record

router
  .route('/:id')
  .get(getLabRecordByPatientId)
  .patch(updateLabRecordById)
  .delete(deleteLabRecordById); // Get a specific lab record by patientId

module.exports = router;
