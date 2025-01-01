// routes/laboratoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLaboratoryDataByMonth,
  getLaboratoryDataByYear,
  createLabRecord,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
} = require('../controllers/labratoryController');

const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin, authorizePharmacist);

router.get('/:year', getLaboratoryDataByYear);
router.get('/:year/:month', getLaboratoryDataByMonth);

// Define routes
router.route('/').post(createLabRecord).get(getAllLabRecords); // Create a new lab record

router
  .route('/:id')
  .get(getLabRecordByPatientId)
  .patch(updateLabRecordById)
  .delete(deleteLabRecordById); // Get a specific lab record by patientId

module.exports = router;
