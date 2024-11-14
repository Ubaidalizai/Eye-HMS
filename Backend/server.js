const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const path = require('path');

const User = require('./models/userModel');
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
const app = express();
const PORT = 4000;

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

// ------------- Signin --------------
let userAuthCheck;
app.post('/api/login', async (req, res) => {
  console.log(req.body);
  // res.send("hi");
  try {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    console.log('USER: ', user);
    if (user) {
      res.send(user);
      console.log(user);
      userAuthCheck = user;
    } else {
      res.status(401).send('Invalid Credentials');
      userAuthCheck = null;
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// Getting User Details of login user
app.get('/api/login', (req, res) => {
  res.send(userAuthCheck);
});
// ------------------------------------

// Registration API
app.post('/api/register', (req, res) => {
  let registerUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    imageUrl: req.body.imageUrl,
  });

  registerUser
    .save()
    .then((result) => {
      res.status(200).send(result);
      alert('Signup Successfull');
    })
    .catch((err) => console.log('Signup: ', err));
  console.log('request: ', req.body);
});

// Here we are listening to the server
app.listen(PORT, () => {
  console.log('I am live again on port', PORT);
});
