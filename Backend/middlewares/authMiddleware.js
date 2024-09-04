const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('./asyncHandler.js');

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  // 1) Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      // 2) Verification token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 3) Check if user is still there
      const currentUser = await User.findById(decoded.userId).select(
        '-password'
      );
      if (!currentUser) {
        res.status(401);
        throw new Error('The user belonging to this token no longer exist!');
      }

      // 4) Check if the user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        res.status(401);
        throw new Error(
          'User recently changed the password, please try again!'
        );
      }
      req.user = currentUser;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed.');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token.');
  }
});

module.exports = authenticate;
