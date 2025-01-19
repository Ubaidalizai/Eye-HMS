// routes/octRoutes.js
const express = require('express');
const router = express.Router();
const {
  getOctDataByYear,
  getOctDataByMonth,
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
  fetchRecordsByPatientId,
} = require('../controllers/octController');

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrPharmacist);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/:year', getOctDataByYear);
router.get('/:year/:month', getOctDataByMonth);

// Define routes
router.route('/').post(createOCTRecord).get(getAllOCTRecords);

router
  .route('/:id')
  .get(getOCTRecordById)
  .patch(updateOCTRecordById)
  .delete(deleteOCTRecordById); // Get a specific OCT record by ID

module.exports = router;
