// Vercel serverless function entry point
const app = require('../app');
const connectDB = require('../config/db');

// Connect to database (cached connection for serverless)
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  try {
    await connectDB();
    cachedDb = true;
    return cachedDb;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Handler for Vercel serverless functions
module.exports = async (req, res) => {
  // Connect to database if not already connected
  await connectToDatabase();
  
  // Handle the request with Express app
  return app(req, res);
};

