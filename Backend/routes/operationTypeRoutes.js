const express = require('express');
const {
  createOperationType,
  getAllOperationTypes,
  getOperationTypeById,
  updateOperationType,
  deleteOperationType,
} = require('../controllers/operationTypeController');

const router = express.Router();

router.route('/').post(createOperationType).get(getAllOperationTypes);

router.patch('/delete/:id', deleteOperationType);

router.route('/:id').get(getOperationTypeById).patch(updateOperationType);

module.exports = router;
