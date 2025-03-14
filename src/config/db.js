const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using the connection string from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some PostgreSQL providers like NeonTech
  }
});

// Test the database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.message));

// Export the pool for use in other modules
module.exports = { pool }; 