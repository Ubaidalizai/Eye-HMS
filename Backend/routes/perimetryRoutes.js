const express = require('express');
const router = express.Router();
const {
  getPerimetryDataByYear,
  getPerimetryDataByMonth,
  createPerimetry,
  getAllPerimetry,
  updatePerimetry,
  deletePerimetry,
  fetchRecordsByPatientId,
  getPerimetryDoctors,
} = require('../controllers/perimetryController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/perimetry-doctors', getPerimetryDoctors);

router.get('/:year', getPerimetryDataByYear);
router.get('/:year/:month', getPerimetryDataByMonth);

// Create an perimetry
router.route('/').post(createPerimetry).get(getAllPerimetry);

router.route('/:id').patch(updatePerimetry).delete(deletePerimetry);

module.exports = router;
