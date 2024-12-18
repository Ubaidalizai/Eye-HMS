const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/authMiddleware');

// Enable authentication middleware for all routes in this file
router.use(authenticate);

const {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientsByMonth,
  getPatientsByYear,
} = require('../controllers/patientController');

router.get('/:year/:month', getPatientsByMonth);
router.get('/:year', getPatientsByYear);

// GET and POST /api/v1/patients – To Get all patients or add a new patient.
router.route('/').get(getAllPatients).post(addPatient);

// PATCH and DELETE /api/v1/patients/:id – To update or delete an existing patient by ID.
router.route('/:id').patch(updatePatient).delete(deletePatient);

module.exports = router;
