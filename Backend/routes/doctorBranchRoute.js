const express = require('express');
const doctorBranchController = require('../controllers/doctorBranchController');

const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router
  .route('/')
  .get(doctorBranchController.getAllBranchesWithDoctors)
  .post(doctorBranchController.assignDoctorToBranch);

router
  .route('/:id')
  .patch(doctorBranchController.updateDoctorAssignment)
  .delete(doctorBranchController.deleteDoctorAssignment);

module.exports = router;
