const express = require('express');
const router = express.Router();
const doctorKhataController = require('../controllers/doctorKhataController');
const {
  authenticate,
  authorizeAdmin,
  authorizeAdminOrDoctor,
} = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get(
  '/doctor-khata/summary',
  authorizeAdminOrDoctor,
  doctorKhataController.getDocKhataSummary
);

router.get(
  '/doctor-khata/yearly/:year',
  authorizeAdminOrDoctor,
  doctorKhataController.getDoctorYearlyKhataStats
);
router.get(
  '/doctor-khata/monthly/:year/:month',
  authorizeAdminOrDoctor,
  doctorKhataController.getDoctorMonthlyKhataStats
);

router.post(
  '/doctor-khata',
  authorizeAdmin,
  doctorKhataController.createDoctorKhata
);
router.get(
  '/doctor-khata/:id',
  authorizeAdmin,
  doctorKhataController.getDoctorKhataById
);
router.get(
  '/doctor-khata',
  authorizeAdminOrDoctor,
  doctorKhataController.getDoctorKhataRecords
);
router.patch(
  '/doctor-khata/:id',
  authorizeAdmin,
  doctorKhataController.updateDoctorKhata
);
router.delete(
  '/doctor-khata/:id',
  authorizeAdmin,
  doctorKhataController.deleteDoctorKhata
);

module.exports = router;
