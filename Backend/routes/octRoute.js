// routes/octRoutes.js
const express = require('express');
const router = express.Router();
const {
  createOCTRecord,
  getAllOCTRecords,
  getOCTRecordById,
  updateOCTRecordById,
  deleteOCTRecordById,
} = require('../controllers/octController');

// Define routes
router.route('/').post(createOCTRecord).get(getAllOCTRecords);

router
  .route('/:id')
  .get(getOCTRecordById)
  .patch(updateOCTRecordById)
  .delete(deleteOCTRecordById); // Get a specific OCT record by ID

module.exports = router;
