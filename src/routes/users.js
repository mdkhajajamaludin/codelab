const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, usersController.getAllUsers);

// Get user by ID (admin only)
router.get('/:id', verifyToken, isAdmin, usersController.getUserById);

// Update user role (admin only)
router.put('/:id/role', verifyToken, isAdmin, usersController.updateUserRole);

module.exports = router; 