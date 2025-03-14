const admin = require('firebase-admin');
const { pool } = require('../config/db');
require('dotenv').config();

// Initialize Firebase Admin with environment variables
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key needs to have newlines properly handled
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  })
});

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Check if user exists in our database
    const userResult = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    
    if (userResult.rows.length === 0) {
      // Create new user if they don't exist
      const email = decodedToken.email || '';
      const displayName = decodedToken.name || '';
      
      const newUserResult = await pool.query(
        'INSERT INTO users (firebase_uid, email, display_name) VALUES ($1, $2, $3) RETURNING *',
        [uid, email, displayName]
      );
      
      req.user = newUserResult.rows[0];
    } else {
      req.user = userResult.rows[0];
    }
    
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    
    const adminResult = await pool.query(
      'SELECT * FROM admin_roles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (adminResult.rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { verifyToken, isAdmin }; 