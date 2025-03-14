const { spawn } = require('child_process');
const path = require('path');

console.log('Setting up database...');

// Run the initDb.js script
const initDb = spawn('node', [path.join(__dirname, 'src/config/initDb.js')]);

initDb.stdout.on('data', (data) => {
  console.log(`initDb.js: ${data}`);
});

initDb.stderr.on('data', (data) => {
  console.error(`initDb.js error: ${data}`);
});

initDb.on('close', (code) => {
  console.log(`initDb.js process exited with code ${code}`);
  
  if (code === 0) {
    console.log('Database setup completed successfully');
  } else {
    console.error('Database setup failed');
    process.exit(1);
  }
  
  process.exit(0);
}); 