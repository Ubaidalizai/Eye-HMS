const express = require('express');
const {
  getUltrasoundDataByYear,
  getUltrasoundDataByMonth,
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/ultrasoundController');

const router = express.Router();

const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin, authorizePharmacist);

router.get('/:year', getUltrasoundDataByYear);
router.get('/:year/:month', getUltrasoundDataByMonth);

router.route('/').post(addRecord).get(getAllRecords); // Get all records

router
  .route('/:id')
  .get(getRecordById)
  .patch(updateRecord)
  .delete(deleteRecord); // Get a single record

module.exports = router;
