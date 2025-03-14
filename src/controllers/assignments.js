const { pool } = require('../config/db');

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assignments ORDER BY created_at DESC'
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      difficulty, 
      language, 
      time_estimate, 
      points, 
      requirements, 
      default_code, 
      category,
      tags,
      hints 
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    // Parse requirements if it's a string
    let requirementsArray;
    if (typeof requirements === 'string') {
      try {
        requirementsArray = JSON.parse(requirements);
      } catch (e) {
        console.error('Error parsing requirements:', e);
        requirementsArray = [];
      }
    } else if (Array.isArray(requirements)) {
      requirementsArray = requirements;
    } else {
      requirementsArray = [];
    }
    
    // Parse tags if it's a string
    let tagsArray;
    if (typeof tags === 'string') {
      try {
        tagsArray = JSON.parse(tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        tagsArray = [];
      }
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    } else {
      tagsArray = [];
    }
    
    const result = await pool.query(
      `INSERT INTO assignments (
        title, 
        description, 
        difficulty, 
        language, 
        time_estimate, 
        points, 
        requirements, 
        default_code, 
        tags,
        hints,
        content
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $2) RETURNING *`,
      [
        title, 
        description, 
        difficulty, 
        language, 
        time_estimate, 
        points, 
        requirementsArray, 
        default_code, 
        tagsArray,
        hints
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      difficulty, 
      language, 
      time_estimate, 
      points, 
      requirements, 
      default_code, 
      category,
      tags,
      hints 
    } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }
    
    // Parse requirements if it's a string
    let requirementsArray;
    if (typeof requirements === 'string') {
      try {
        requirementsArray = JSON.parse(requirements);
      } catch (e) {
        console.error('Error parsing requirements:', e);
        requirementsArray = [];
      }
    } else if (Array.isArray(requirements)) {
      requirementsArray = requirements;
    } else {
      requirementsArray = [];
    }
    
    // Parse tags if it's a string
    let tagsArray;
    if (typeof tags === 'string') {
      try {
        tagsArray = JSON.parse(tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        tagsArray = [];
      }
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    } else {
      tagsArray = [];
    }
    
    const result = await pool.query(
      `UPDATE assignments SET 
        title = $1, 
        description = $2, 
        difficulty = $3, 
        language = $4, 
        time_estimate = $5, 
        points = $6, 
        requirements = $7, 
        default_code = $8, 
        tags = $9,
        hints = $10,
        content = $2,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $11 RETURNING *`,
      [
        title, 
        description, 
        difficulty, 
        language, 
        time_estimate, 
        points, 
        requirementsArray, 
        default_code, 
        tagsArray,
        hints,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete an assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM assignments WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 