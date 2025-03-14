const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const assignmentRoutes = require('./routes/assignments');
const progressRoutes = require('./routes/progress');
const userRoutes = require('./routes/users');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the CodeLab API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 