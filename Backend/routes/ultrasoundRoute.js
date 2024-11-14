// routes/ultrasoundRoutes.js
const express = require('express');
const {
  addRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} = require('../controllers/ultrasoundController');

const router = express.Router();

router.route('/').post(addRecord).get(getAllRecords); // Get all records

router
  .route('/:id')
  .get(getRecordById)
  .patch(updateRecord)
  .delete(deleteRecord); // Get a single record

module.exports = router;
