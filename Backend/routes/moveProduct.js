const express = require('express');
const router = express.Router();
const {
  getDrugMovementByYear,
  getDrugMovementByMonth,
  moveProductsToPharmacy,
  getAllProductMovements,
  deleteMovement,
} = require('../controllers/moveProductController');
const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin);

router.get('/:year', getDrugMovementByYear);
router.get('/:year/:month', getDrugMovementByMonth);

// Move Drugs From Inventory to pharmacy
router.post('/', moveProductsToPharmacy);

router.get('/', getAllProductMovements);

router.delete('/:id', deleteMovement);

module.exports = router;
