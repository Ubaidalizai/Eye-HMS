const express = require('express');
const router = express.Router();

const {
  createIncome,
  getAllIncome,
  updateIncome,
  deleteIncome,
  filterIncomeByYear,
  filterIncomeByYearAndMonth,
} = require('../controllers/IncomeController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/:year', filterIncomeByYear);
router.get('/:year/:month', filterIncomeByYearAndMonth);
// Route for creating a new income record
router.route('/').post(createIncome).get(getAllIncome);

router.route('/:id').patch(updateIncome).delete(deleteIncome);

module.exports = router;
