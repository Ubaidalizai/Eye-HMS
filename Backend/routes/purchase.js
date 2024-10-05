<<<<<<< HEAD
const express = require('express');
const router = express.Router();
const purchase = require('../controllers/purchase');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);
router.get('/totalPurchaseAmount', purchase.getTotalPurchaseAmount);

router.route('/').get(purchase.getPurchaseData).post(purchase.addPurchase);

module.exports = router;
=======
const express = require("express");
const app = express();
const purchase = require("../controllers/purchase");

// Add Purchase
app.post("/add", purchase.addPurchase);

// Get All Purchase Data
app.get("/get/:userID", purchase.getPurchaseData);

app.get("/get/:userID/totalpurchaseamount", purchase.getTotalPurchaseAmount);

module.exports = app;

// http://localhost:4000/api/purchase/add POST
// http://localhost:4000/api/purchase/get GET
>>>>>>> origin/master
