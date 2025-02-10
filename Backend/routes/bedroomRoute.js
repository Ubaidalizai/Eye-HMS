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
  fetchRecordsByPatientId,
  getBedroomDoctors,
} = require('../controllers/bedroomConroller');

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/bedroom-doctors', getBedroomDoctors);

router.get('/:year', getBedroomDataByYear);
router.get('/:year/:month', getBedroomDataByMonth);

router.route('/').post(createBedroom).get(getAllBedrooms);

router
  .route('/:id')
  .get(getBedroomById)
  .patch(updateBedroom)
  .delete(deleteBedroom);

module.exports = router;
