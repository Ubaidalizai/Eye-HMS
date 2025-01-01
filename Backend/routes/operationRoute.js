const express = require('express');
const router = express.Router();
const {
  createOperation,
  getAllOperations,
  updateOperation,
  deleteOperation,
} = require('../controllers/operationController');

const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin, authorizePharmacist);

// Create an operation
router.route('/').post(createOperation).get(getAllOperations);

router.route('/:id').patch(updateOperation).delete(deleteOperation);

module.exports = router;
