const express = require('express');
const app = express();

const router = express.Router();
const pharmacy = require('../controllers/pharmacy');
const {
  authenticate,
  authorizeAdmin,
  authorizePharmacist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdmin, authorizePharmacist);

router.route('/drugs-summary').get(pharmacy.getDrugsSummary);

// Check for expired drugs
router.get('/expire', pharmacy.checkDrugExpiry);

router.get('/', pharmacy.getAllDrugsInPharmacy);
router
  .route('/:id')
  .get(pharmacy.getDrug)
  .patch(pharmacy.updateDrug)
  .delete(pharmacy.deleteDrug);

module.exports = router;
