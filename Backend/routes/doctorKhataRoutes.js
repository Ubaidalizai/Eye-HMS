const express = require('express');
const router = express.Router();
const doctorKhataController = require('../controllers/doctorKhataController');

router.post('/doctor-khata', doctorKhataController.createDoctorKhata);

module.exports = router;
