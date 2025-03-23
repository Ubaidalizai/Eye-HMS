const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  // Generate a JWT token with the userId payload
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });

  // Set the JWT as an HTTP-Only cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Cookie is only accessible by the server
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'Strict', // Prevent CSRF attacks by restricting cross-site requests
    maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  });

  return token; // Return the token for further use if needed
};

module.exports = generateToken;
