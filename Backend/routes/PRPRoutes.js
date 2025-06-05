const express = require('express');
const router = express.Router();
const {
  getPRPDataByYear,
  getPRPDataByMonth,
  createPRP,
  getAllPRP,
  updatePRP,
  deletePRP,
  fetchRecordsByPatientId,
  getPRPDoctors,
} = require('../controllers/PRPController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/PRP-doctors', getPRPDoctors);

router.get('/:year', getPRPDataByYear);
router.get('/:year/:month', getPRPDataByMonth);

// Create an PRP
router.route('/').post(createPRP).get(getAllPRP);

router.route('/:id').patch(updatePRP).delete(deletePRP);

module.exports = router;
