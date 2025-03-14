const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run shell commands
const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Failed to execute ${command}`, error);
    return false;
  }
};

// Check if .env file exists, if not create it
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('Creating .env file...');
  const envExample = `# Database Configuration
DATABASE_URL=postgres://your-neon-connection-string

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Admin SDK (Get this from Firebase Console > Project Settings > Service Accounts)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com`;

  fs.writeFileSync(envFile, envExample);
  console.log('.env file created. Please update it with your credentials.');
}

// Install dependencies
console.log('Installing dependencies...');
const installDepsResult = runCommand('npm install');
if (!installDepsResult) {
  console.error('Failed to install dependencies');
  process.exit(1);
}

console.log('Installing firebase-admin...');
const installFirebaseResult = runCommand('npm install firebase-admin');
if (!installFirebaseResult) {
  console.error('Failed to install firebase-admin');
  process.exit(1);
}

console.log('\n');
console.log('Setup completed successfully!');
console.log('\n');
console.log('Next steps:');
console.log('1. Update the .env file with your database credentials and Firebase configuration');
console.log('2. Initialize the database: node src/config/initDb.js');
console.log('3. Start the server: npm run dev'); 