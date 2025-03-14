const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Read the SQL schema file
    const schemaFilePath = path.join(__dirname, 'schema.sql');
    const schemaScript = fs.readFileSync(schemaFilePath, 'utf8');
    
    // Execute the SQL script
    await pool.query(schemaScript);
    
    console.log('Tables created successfully');
    
    // Check if there are any users
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(usersResult.rows[0].count);
    console.log(`Current user count: ${userCount}`);
    
    // Check if there are any assignments
    const assignmentsResult = await pool.query('SELECT COUNT(*) FROM assignments');
    const assignmentCount = parseInt(assignmentsResult.rows[0].count);
    console.log(`Current assignment count: ${assignmentCount}`);
    
    // Database initialization completed
    console.log('Database initialization completed successfully');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 