const express = require('express');
const {
  getYeglizerDataByYear,
  getYeglizerDataByMonth,
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
  fetchRecordsByPatientId,
  getYglizerDoctors,
} = require('../controllers/yeglizerController');

const router = express.Router();

const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.get('/search/:patientID', fetchRecordsByPatientId);

router.get('/yeglizer-doctors', getYglizerDoctors);

router.get('/:year', getYeglizerDataByYear);
router.get('/:year/:month', getYeglizerDataByMonth);

router.route('/').get(getAllYeglizers).post(createYeglizer);

router
  .route('/:id')
  .get(getYeglizerById)
  .patch(updateYeglizerById)
  .delete(deleteYeglizerById);

module.exports = router;
