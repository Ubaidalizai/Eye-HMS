const mongoose = require('mongoose');

// Cache the connection to reuse in serverless environments
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Optimize for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn.connection;
    console.log(`Successfully connected to mongoDB 👍`);
    return cachedConnection;
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
