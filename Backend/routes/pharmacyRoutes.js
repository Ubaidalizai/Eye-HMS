const express = require('express');
const app = express();

const router = express.Router();
const pharmacy = require('../controllers/pharmacy');
const {
  authenticate,
  authorize3Users,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorize3Users);

router.route('/drugs-summary').get(pharmacy.getDrugsSummary);

// Check for expired drugs
router.get('/expire', pharmacy.checkDrugExpiry);

// Check for low stock drugs
router.get('/low-stock', pharmacy.getLowStockDrugs);

router.get('/', pharmacy.getAllDrugsInPharmacy);
router
  .route('/:id')
  .get(pharmacy.getDrug)
  .patch(pharmacy.updateDrug)
  .delete(pharmacy.deleteDrug);

module.exports = router;
