const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/IncomeController');

// Route for creating a new income record
router.post('/income', incomeController.createIncome);

// Route for updating an income record by ID
router.put('/income/:id', incomeController.updateIncome);

// Route for retrieving all income records
router.get('/income', incomeController.getAllIncome);

// Route for retrieving a single income record by ID
router.get('/income/:id', incomeController.getIncomeById);

// Route for deleting an income record by ID
router.delete('/income/:id', incomeController.deleteIncome);

module.exports = router;
