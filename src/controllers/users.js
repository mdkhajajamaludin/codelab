const { pool } = require('../config/db');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM admin_roles WHERE user_id = u.id) > 0 AS is_admin,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id) AS assignments_count,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id AND status = 'completed') AS completed_count
       FROM users u
       ORDER BY u.created_at DESC`
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT u.*, 
        (SELECT COUNT(*) FROM admin_roles WHERE user_id = u.id) > 0 AS is_admin,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id) AS assignments_count,
        (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id AND status = 'completed') AS completed_count
       FROM users u
       WHERE u.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role (admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;
    
    if (isAdmin === undefined) {
      return res.status(400).json({ message: 'isAdmin field is required' });
    }
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if trying to remove admin role from self
    if (req.user.id === parseInt(id) && !isAdmin) {
      return res.status(403).json({ message: 'Cannot remove admin role from yourself' });
    }
    
    // Update admin role
    if (isAdmin) {
      // Add admin role if not exists
      await pool.query(
        'INSERT INTO admin_roles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [id]
      );
    } else {
      // Remove admin role
      await pool.query(
        'DELETE FROM admin_roles WHERE user_id = $1',
        [id]
      );
    }
    
    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
};