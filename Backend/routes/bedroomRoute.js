const express = require('express');
const router = express.Router();
const {
  createBedroom,
  getAllBedrooms,
  updateBedroom,
  deleteBedroom,
} = require('../controllers/bedroomConroller');

router.route('/').post(createBedroom).get(getAllBedrooms);

router.route('/:id').patch(updateBedroom).delete(deleteBedroom);

module.exports = router;
