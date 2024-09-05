const express = require("express");
const app = express();
const pharmacy = require("../controllers/pharmacy");

// Add Sales for 
app.post('/drugs/sell', pharmacy.sellDrugs);
app.get('/drugs', pharmacy.getAllDrugsInPharmacy);
app.get('/drugs/:id', pharmacy.getDrug);
app.patch('/drugs/:id', pharmacy.updateDrug);
app.delete('/drugs/:id', pharmacy.deleteDrug);
// Add Sales
app.post("/add", pharmacy.getDrugsInPharmacy);

module.exports = app;
