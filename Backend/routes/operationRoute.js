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
} = require('../controllers/operationController');

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrPharmacist);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/:year', getOperationDataByYear);
router.get('/:year/:month', getOperationDataByMonth);

// Create an operation
router.route('/').post(createOperation).get(getAllOperations);

router.route('/:id').patch(updateOperation).delete(deleteOperation);

module.exports = router;
