const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress');
const { verifyToken } = require('../middleware/auth');

// Get progress for current user
router.get('/', verifyToken, progressController.getUserProgress);

// Get progress statistics
router.get('/stats', verifyToken, progressController.getProgressStats);

// Get progress for a specific assignment
router.get('/:assignmentId', verifyToken, progressController.getAssignmentProgress);

// Update progress for an assignment
router.post('/', verifyToken, progressController.updateProgress);

module.exports = router; 