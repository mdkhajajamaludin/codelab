const { pool } = require('./src/config/db');
require('dotenv').config();

async function addAdminRole() {
  try {
    console.log('Connecting to database...');
    
    // Get all users
    const usersResult = await pool.query('SELECT * FROM users');
    
    if (usersResult.rows.length === 0) {
      console.log('No users found in the database.');
      process.exit(1);
    }
    
    console.log('Users found:');
    usersResult.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.email}`);
    });
    
    // Use the first user by default
    const userId = usersResult.rows[0].id;
    
    // Check if user already has admin role
    const adminCheckResult = await pool.query(  
      'SELECT * FROM admin_roles WHERE user_id = $1',
      [userId]
    );
    
    if (adminCheckResult.rows.length > 0) {
      console.log(`User with ID ${userId} already has admin role.`);
    } else {
      // Add admin role
      await pool.query(
        'INSERT INTO admin_roles (user_id) VALUES ($1)',
        [userId]
      );
      
      console.log(`Admin role added to user with ID ${userId}.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding admin role:', error);
    process.exit(1);
  }
}

// Run the function
addAdminRole(); 