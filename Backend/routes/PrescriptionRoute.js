// routes/prescriptionRoutes.js

const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
} = require('../controllers/PrescriptionController');

// Create a new prescription
router.route('/patient/:patient_Id/prescreption').post(createPrescription);
router.route('/').get(getAllPrescriptions);

// Get a single prescription by ID
router
  .route('/prescription/:id')
  .get(getPrescriptionById)
  .patch(updatePrescription)
  .delete(deletePrescription);

module.exports = router;
