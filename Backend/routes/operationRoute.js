const express = require('express');
const router = express.Router();
const {
  getOperationDataByYear,
  getOperationDataByMonth,
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
  fetchRecordsByPatientId,
  getOperationDoctors,
} = require('../controllers/operationController');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/operation-doctors', getOperationDoctors);

router.get('/:year', getOperationDataByYear);
router.get('/:year/:month', getOperationDataByMonth);

// Create an operation
router.route('/').post(createOperation).get(getAllOperations);

router.route('/:id').patch(updateOperation).delete(deleteOperation);

module.exports = router;
