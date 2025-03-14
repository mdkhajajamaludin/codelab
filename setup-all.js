const { spawn } = require('child_process');
const path = require('path');

console.log('Setting up database...');

// Function to run a script and return a promise
function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${path.basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath]);
    
    process.stdout.on('data', (data) => {
      console.log(`${path.basename(scriptPath)}: ${data}`);
    });
    
    process.stderr.on('data', (data) => {
      console.error(`${path.basename(scriptPath)} error: ${data}`);
    });
    
    process.on('close', (code) => {
      console.log(`${path.basename(scriptPath)} process exited with code ${code}`);
      
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${path.basename(scriptPath)} failed with code ${code}`));
      }
    });
  });
}

// Run all scripts in sequence
async function setupAll() {
  try {
    // 1. Initialize the database
    await runScript(path.join(__dirname, 'src/config/initDb.js'));
    console.log('Database initialization successful');
    
    // 2. Run the migration
    await runScript(path.join(__dirname, 'src/config/migrate-schema.js'));
    console.log('Migration successful');
    
    // 3. Fix data issues
    await runScript(path.join(__dirname, 'src/config/fix-data.js'));
    console.log('Data fix successful');
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupAll(); 