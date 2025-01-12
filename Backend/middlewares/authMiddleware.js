const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('./asyncHandler.js');
const AppError = require('../utils/appError'); // Adjust the path as necessary

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  // 1) Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // 2) Verification token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 3) Check if user is still there
      const currentUser = await User.findById(decoded.userId);
      if (!currentUser) {
        throw new AppError(
          'The user belonging to this token no longer exists!',
          401
        );
      }
      // 4) Check if the user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        throw new AppError(
          'User recently changed the password, please try again!',
          401
        );
      }
      req.user = currentUser;
      next();
    } catch (error) {
      throw new AppError('Not authorized, token failed.', 401);
    }
  } else {
    throw new AppError('Not authorized, no token.', 401);
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Not authorized as an admin.');
  }
};

const authorizeAdminOrPharmacist = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'admin' || req.user.role === 'pharmacist')
  ) {
    next(); // Proceed if user is admin or pharmacist
  } else {
    res.status(403).json({
      message: 'Access denied: Admin or Pharmacist authorization required.',
    });
  }
};

const authorizeSunglassesSeller = (req, res, next) => {
  if (req.user && req.user.role === 'sunglassesSeller') {
    next();
  } else {
    res.status(401).send('Not authorized as an sunglasses seller.');
  }
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeAdminOrPharmacist,
  authorizeSunglassesSeller,
};
