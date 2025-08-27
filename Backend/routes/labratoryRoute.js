// routes/laboratoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLaboratoryDataByMonth,
  getLaboratoryDataByYear,
  createLabRecord,
  createMultipleLabRecords,
  getAllLabRecords,
  getLabRecordByPatientId,
  updateLabRecordById,
  deleteLabRecordById,
  fetchRecordsByPatientId,
  getLaboratoryDoctors,
} = require('../controllers/labratoryController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/labratory-doctors', getLaboratoryDoctors);

router.get('/:year', getLaboratoryDataByYear);
router.get('/:year/:month', getLaboratoryDataByMonth);

router.route('/').post(createLabRecord).get(getAllLabRecords);
router.route('/multiple').post(createMultipleLabRecords);

router
  .route('/:id')
  .get(getLabRecordByPatientId)
  .patch(updateLabRecordById)
  .delete(deleteLabRecordById);
module.exports = router;
