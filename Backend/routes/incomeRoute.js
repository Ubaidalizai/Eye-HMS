const express = require('express');
const router = express.Router();
const {
  createIncome,
  getAllIncome,
  updateIncome,
  getIncomeById,
  deleteIncome,
  filterIncomeByYear,
  filterIncomeByYearAndMonth,
} = require('../controllers/IncomeController');
router.get('/filterIncomeByYear', filterIncomeByYear);
router.get('/filterIncomeByYearAndMonth', filterIncomeByYearAndMonth);
// Route for creating a new income record
router.route('/income').post(createIncome).get(getAllIncome);

router
  .route('/income/:id')
  .patch(updateIncome)
  .get(getIncomeById)
  .delete(deleteIncome);

module.exports = router;
