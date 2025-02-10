const express = require('express');
const router = express.Router();

const {
  authenticate,
  authorizeAdmin,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

const {
  getAllPatients,
  addPatient,
  updatePatient,
  deletePatient,
  getPatientsByMonth,
  getPatientsByYear,
} = require('../controllers/patientController');

router.get('/:year/:month', authorizeAdmin, getPatientsByMonth);
router.get('/:year', authorizeAdmin, getPatientsByYear);

// GET and POST /api/v1/patients – To Get all patients or add a new patient.
router.route('/').get(getAllPatients).post(addPatient);

// PATCH and DELETE /api/v1/patients/:id – To update or delete an existing patient by ID.
router.route('/:id').patch(updatePatient).delete(deletePatient);

module.exports = router;
