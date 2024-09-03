const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/userModel');
const productRoute = require('./routes/product');
const storeRoute = require('./routes/store');
const purchaseRoute = require('./routes/purchase');
const salesRoute = require('./routes/sales');
const pharmacyRoute = require('./routes/pharmacyRoutes');

const app = express();
const PORT = 4000;

connectDB(); // Connect database

app.use(express.json());
app.use(cookieParser());

// Configure CORS middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Frontend URL
    credentials: true,
  })
);

// Routes
app.use('/api/v1/user', userRoutes); // User API
app.use('/api/store', storeRoute); // Store API
app.use('/api/product', productRoute); // Products API
app.use('/api/purchase', purchaseRoute); // Purchase API
app.use('/api/sales', salesRoute); // Sales API
app.use('/api/pharmacy', pharmacyRoute); // Pharmacy API

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
  console.log('I am live again');
});
