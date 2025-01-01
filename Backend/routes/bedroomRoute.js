const express = require('express');
const router = express.Router();
const {
  getBedroomDataByYear,
  getBedroomDataByMonth,
  createBedroom,
  getAllBedrooms,
  getBedroomById,
  updateBedroom,
  deleteBedroom,
} = require('../controllers/bedroomConroller');

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrPharmacist);

router.get('/:year', getBedroomDataByYear);
router.get('/:year/:month', getBedroomDataByMonth);

router.route('/').post(createBedroom).get(getAllBedrooms);

router
  .route('/:id')
  .get(getBedroomById)
  .patch(updateBedroom)
  .delete(deleteBedroom);

module.exports = router;
