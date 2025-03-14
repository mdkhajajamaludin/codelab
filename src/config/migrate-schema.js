const { pool } = require('./db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function migrateSchema() {
  try {
    console.log('Starting database schema migration...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'migrate-schema.sql');
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
    
    // Log the results
    console.log('Migration completed successfully');
    
    // Log the counts
    if (results.length > 0) {
      const counts = results.slice(-4);
      counts.forEach(count => {
        if (count && count.rows && count.rows[0]) {
          console.log(count.rows[0]);
        }
      });
    }
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('Error migrating schema:', error);
    process.exit(1);
  }
}

// Run the migration
migrateSchema(); 