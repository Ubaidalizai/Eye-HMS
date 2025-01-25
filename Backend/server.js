const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');

const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const productRoute = require('./routes/product');
const purchaseRoute = require('./routes/purchase');
const salesRoute = require('./routes/salesRoutes');
const pharmacyRoute = require('./routes/pharmacyRoutes');
const patientRoute = require('./routes/patientsRoutes');
const expensesRoute = require('./routes/ExpensesRoute');
const incomeRoute = require('./routes/incomeRoute');
const prescriptionRoute = require('./routes/PrescriptionRoute');
const dashboardRoute = require('./routes/dashboaredRoutes');
const operationRoute = require('./routes/operationRoute');
const ultrasoundRoute = require('./routes/ultrasoundRoute');
const bedroomRoute = require('./routes/bedroomRoute');
const labratoryRoute = require('./routes/labratoryRoute');
const OctRoute = require('./routes/octRoute');
const backupRoute = require('./routes/backupRoutes');
const OpdRoute = require('./routes/opdRoute');
const yeglizerRoute = require('./routes/yeglizerRoutes');
const doctorKhataRoute = require('./routes/doctorKhataRoutes');
const moveProductRoute = require('./routes/moveProduct');

const app = express();
const PORT = process.env.PORT || 4000;

connectDB(); // Connect database

// Serve static images
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Configure CORS middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Routes
app.use('/api/v1/user', userRoutes); // User API
app.use('/api/v1/inventory', productRoute); // Products API
app.use('/api/v1/purchase', purchaseRoute); // Purchase API
app.use('/api/v1/sales', salesRoute); // Sales API
app.use('/api/v1/pharmacy', pharmacyRoute); // Pharmacy API
app.use('/api/v1/patient', patientRoute); // Patient API
app.use('/api/v1/expense', expensesRoute); // Expenses API
app.use('/api/v1/income', incomeRoute); // Income API
app.use('/api/v1/prescriptions', prescriptionRoute); // Prescriptions API
app.use('/api/v1/dashboard', dashboardRoute); // Dashboard API
app.use('/api/v1/operation', operationRoute);
app.use('/api/v1/ultrasound', ultrasoundRoute);
app.use('/api/v1/bedroom', bedroomRoute);
app.use('/api/v1/labratory', labratoryRoute);
app.use('/api/v1/oct', OctRoute);
app.use('/api/v1/opd', OpdRoute);
app.use('/api/v1/yeglizer', yeglizerRoute);
app.use('/api/v1/move-product', moveProductRoute);
app.use('/api/v1/backup', backupRoute);
app.use('/api/v1/khata', doctorKhataRoute);


// Here we are listening to the server
app.listen(PORT, () => {
  console.log('I am live again on port', PORT);
});
