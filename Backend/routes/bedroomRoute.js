const express = require('express');
const router = express.Router();
const {
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
} = require('../controllers/bedroomConroller');

router.route('/').post(createBedroom).get(getAllBedrooms);

router
  .route('/:id')
  .get(getBedroomById)
  .patch(updateBedroom)
  .delete(deleteBedroom);

module.exports = router;
