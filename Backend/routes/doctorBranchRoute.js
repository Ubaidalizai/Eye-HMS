const express = require('express');
const doctorBranchController = require('../controllers/doctorBranchController');

const {
  authenticate,
  authorizeAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.patch('/:id', doctorBranchController.updateDoctorAssignment);
router.delete('/:id', doctorBranchController.deleteDoctorAssignment);

router
  .route('/')
  .get(doctorBranchController.getAllBranchesWithDoctors)
  .post(doctorBranchController.assignDoctorToBranch);

module.exports = router;
