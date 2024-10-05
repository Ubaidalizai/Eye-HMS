<<<<<<< HEAD
const express = require("express");
const app = express();

const router = express.Router();
const pharmacy = require("../controllers/pharmacy");
const { authenticate } = require("../middlewares/authMiddleware");

router.use(authenticate); // Enable authentication middleware for all routes in this file

router.get('/', pharmacy.getAllDrugsInPharmacy);
router
  .route("/:id")
=======
const express = require('express');
const app = express();

const router = express.Router();
const pharmacy = require('../controllers/pharmacy');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate); // Enable authentication middleware for all routes in this file

// Add Sales for
router.post('/drugs/sell', authenticate, pharmacy.sellDrugs);
router.get('/drugs', pharmacy.getAllDrugsInPharmacy);

router
  .route('/drugs/:id')
>>>>>>> origin/master
  .get(pharmacy.getDrug)
  .patch(pharmacy.updateDrug)
  .delete(pharmacy.deleteDrug);

module.exports = router;
