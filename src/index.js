const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const assignmentRoutes = require('./routes/assignments');
const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('CodeLab API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 