// Vercel serverless function entry point
const app = require('../app');
const connectDB = require('../config/db');

// Cache database connection for serverless
let dbConnected = false;

// Initialize database connection
(async () => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
  } catch (error) {
    console.error('Initial DB connection error:', error);
  }
})();

// Export Express app directly for Vercel
module.exports = app;

