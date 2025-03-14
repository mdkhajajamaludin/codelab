const express = require('express');
const router = express.Router();
const assignmentsController = require('../controllers/assignments');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all assignments (public)
router.get('/', assignmentsController.getAllAssignments);

// Get assignment by ID (public)
router.get('/:id', assignmentsController.getAssignmentById);

// Create a new assignment (admin only)
router.post('/', verifyToken, isAdmin, assignmentsController.createAssignment);

// Update an assignment (admin only)
router.put('/:id', verifyToken, isAdmin, assignmentsController.updateAssignment);

// Delete an assignment (admin only)
router.delete('/:id', verifyToken, isAdmin, assignmentsController.deleteAssignment);

module.exports = router; 