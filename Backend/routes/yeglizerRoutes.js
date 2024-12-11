const express = require('express');
const {
  createYeglizer,
  getAllYeglizers,
  getYeglizerById,
  updateYeglizerById,
  deleteYeglizerById,
} = require('../controllers/yeglizerController');

const router = express.Router();

router.route('/').get(getAllYeglizers).post(createYeglizer);

router
  .route('/:id')
  .get(getYeglizerById)
  .patch(updateYeglizerById)
  .delete(deleteYeglizerById);

module.exports = router;
