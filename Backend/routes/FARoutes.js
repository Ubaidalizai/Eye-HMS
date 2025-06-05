const express = require('express');
const router = express.Router();
const {
  getFADataByYear,
  getFADataByMonth,
  createFA,
  getAllFA,
  updateFA,
  deleteFA,
  fetchRecordsByPatientId,
  getFADoctors,
} = require('../controllers/FAController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/FA-doctors', getFADoctors);

router.get('/:year', getFADataByYear);
router.get('/:year/:month', getFADataByMonth);

// Create an FA
router.route('/').post(createFA).get(getAllFA);

router.route('/:id').patch(updateFA).delete(deleteFA);

module.exports = router;
