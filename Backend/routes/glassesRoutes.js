const express = require('express');
const router = express.Router();
const glasses = require('../controllers/glassController');
const {
  authenticate,
  authorizeAdminOrReceptionist,
} = require('../middlewares/authMiddleware');

router.use(authenticate, authorizeAdminOrReceptionist);

router.get('/summary', glasses.getGlassesSummary);
router.get('/low-stock', glasses.getLowStockGlasses);

router.route('/').get(glasses.getAllGlasses).post(glasses.addGlass);

router
  .route('/:id')
  .get(glasses.getGlassById)
  .patch(glasses.updateGlass)
  .delete(glasses.deleteGlass);

module.exports = router;
