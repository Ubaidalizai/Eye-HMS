const express = require('express');
const {
  getYeglizerDataByYear,
  getYeglizerDataByMonth,
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
} = require('../controllers/yeglizerController');

const router = express.Router();

const {
  authenticate,
  authorizeAdminOrPharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrPharmacist);

router.get('/:year', getYeglizerDataByYear);
router.get('/:year/:month', getYeglizerDataByMonth);

router.route('/').get(getAllYeglizers).post(createYeglizer);

router
  .route('/:id')
  .get(getYeglizerById)
  .patch(updateYeglizerById)
  .delete(deleteYeglizerById);

module.exports = router;
