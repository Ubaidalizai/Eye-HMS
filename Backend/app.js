const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errController');

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
const doctorBranchRoute = require('./routes/doctorBranchRoute');
const operationTypeRoute = require('./routes/operationTypeRoutes');
const pharmacyTotalSalesRoute = require('./routes/pharmacySalesTotalRoutes');
const pharmacyLogRoute = require('./routes/pharmacyLogRoutes');
const glassesRoutes = require('./routes/glassesRoutes');

const app = express();

// GLOBAL MIDDLEWARES
// Serving static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  message: 'Too many requests. Please slow down.',
});
app.use('/api', limiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

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
app.use('/api/v1/doctor-branch', doctorBranchRoute);
app.use('/api/v1/operation-types', operationTypeRoute);
app.use('/api/v1/pharmacyTotal', pharmacyTotalSalesRoute);
app.use('/api/v1/pharmacy-logs', pharmacyLogRoute);
app.use('/api/v1/glasses', glassesRoutes);

app.all('*', (req, res) => {
  throw new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(globalErrorHandler);

module.exports = app;
