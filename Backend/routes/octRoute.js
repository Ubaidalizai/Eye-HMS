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
  getOctDoctors,
} = require('../controllers/octController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/oct-doctors', getOctDoctors);

router.get('/:year', getOctDataByYear);
router.get('/:year/:month', getOctDataByMonth);

router.route('/').post(createOCTRecord).get(getAllOCTRecords);

router
  .route('/:id')
  .get(getOCTRecordById)
  .patch(updateOCTRecordById)
  .delete(deleteOCTRecordById);

module.exports = router;
