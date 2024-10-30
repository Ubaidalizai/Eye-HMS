// routes/prescriptionRoutes.js

const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatientId,
  getPrescriptionsByPatientName,
} = require('../controllers/PrescriptionController');

router.get('/patient/:patientId', getPrescriptionsByPatientId);
// Route to get all prescriptions by patient name
router.get('/patients/name/:name/prescriptions', getPrescriptionsByPatientName);
// Create a new prescription
router.route('/patient/name/:patientName').post(createPrescription);
router.route('/').get(getAllPrescriptions);

// Get a single prescription by ID
router
  .route('/prescription/:id')
  .get(getPrescriptionById)
  .patch(updatePrescription)
  .delete(deletePrescription);

module.exports = router;
