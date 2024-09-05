const express = require("express");
const app = express();
const pharmacy = require("../controllers/pharmacy");

// Add Sales
app.post("/add", pharmacy.getDrugsInPharmacy);

module.exports = app;
