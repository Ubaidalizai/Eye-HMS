const express = require('express');
const router = express.Router();
const doctorKhataController = require('../controllers/doctorKhataController');

router.get(
  '/doctor-khata/:id/summary',
  doctorKhataController.getDocKhataSummary
);

router.post('/doctor-khata', doctorKhataController.createDoctorKhata);
router.get('/doctor-khata/:id', doctorKhataController.getDoctorKhataById);
router.patch('/doctor-khata/:id', doctorKhataController.updateDoctorKhata);
router.delete('/doctor-khata/:id', doctorKhataController.deleteDoctorKhata);

module.exports = router;
