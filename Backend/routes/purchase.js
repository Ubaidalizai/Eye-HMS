const express = require('express');
const router = express.Router();
const purchase = require('../controllers/purchase');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/totalPurchaseAmount', purchase.getTotalPurchaseAmount);

router.route('/').get(purchase.getPurchaseData).post(purchase.addPurchase);

module.exports = router;
