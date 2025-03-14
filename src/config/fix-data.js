const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixData() {
  try {
    console.log('Running data fix script...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-data.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the script into separate statements
    const statements = sqlScript.split(';').filter(stmt => stmt.trim() !== '');
    
    // Execute each statement separately
    let results = [];
    for (const statement of statements) {
      try {
        const result = await pool.query(statement + ';');
        if (result.rows && result.rows.length > 0) {
          results.push(result);
        }
      } catch (err) {
        console.warn(`Warning: Statement failed: ${err.message}`);
        console.warn(`Failed statement: ${statement.substring(0, 100)}...`);
        // Continue with next statement
      }
    }
    
    console.log('Data fix completed successfully');
    if (results.length > 0 && results[results.length - 1].rows) {
      console.log('Fixed assignments:', results[results.length - 1].rows);
    }
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error fixing data:', error);
    process.exit(1);
  }
}

// Run the fix
fixData(); 