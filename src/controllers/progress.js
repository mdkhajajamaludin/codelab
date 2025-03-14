const { pool } = require('../config/db');

// Get progress for current user
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT up.*, a.title, a.difficulty, a.language, a.points
       FROM user_progress up
       JOIN assignments a ON up.assignment_id = a.id
       WHERE up.user_id = $1
       ORDER BY up.updated_at DESC`,
      [userId]
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress for a specific assignment
exports.getAssignmentProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId } = req.params;
    
    const result = await pool.query(
      `SELECT up.*, a.title, a.difficulty, a.language, a.content, a.description, a.default_code
       FROM user_progress up
       JOIN assignments a ON up.assignment_id = a.id
       WHERE up.user_id = $1 AND up.assignment_id = $2`,
      [userId, assignmentId]
    );
    
    if (result.rows.length === 0) {
      // If no progress exists, get the assignment details
      const assignmentResult = await pool.query(
        'SELECT * FROM assignments WHERE id = $1',
        [assignmentId]
      );
      
      if (assignmentResult.rows.length === 0) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // Return assignment details with default progress values
      return res.status(200).json({
        user_id: userId,
        assignment_id: parseInt(assignmentId),
        status: 'not_started',
        code: '',
        score: 0,
        completed_at: null,
        ...assignmentResult.rows[0]
      });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching assignment progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get progress statistics for current user
exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total assignments count
    const totalAssignmentsResult = await pool.query(
      'SELECT COUNT(*) FROM assignments'
    );
    const totalAssignments = parseInt(totalAssignmentsResult.rows[0].count);
    
    // Get user progress stats
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_assignments,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_assignments,
        SUM(score) AS points_earned
       FROM user_progress
       WHERE user_id = $1`,
      [userId]
    );
    
    const stats = statsResult.rows[0];
    
    res.status(200).json({
      totalAssignments,
      completedAssignments: parseInt(stats.completed_assignments) || 0,
      inProgressAssignments: parseInt(stats.in_progress_assignments) || 0,
      pointsEarned: parseInt(stats.points_earned) || 0
    });
  } catch (error) {
    console.error('Error fetching progress stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update progress for an assignment
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId, status, code, score } = req.body;
    
    if (!assignmentId || !status) {
      return res.status(400).json({ message: 'Assignment ID and status are required' });
    }
    
    // Check if the assignment exists
    const assignmentResult = await pool.query(
      'SELECT * FROM assignments WHERE id = $1',
      [assignmentId]
    );
    
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    // Get assignment points
    const assignmentPoints = assignmentResult.rows[0].points || 0;
    
    // Check if progress already exists
    const progressResult = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1 AND assignment_id = $2',
      [userId, assignmentId]
    );
    
    let result;
    const completedAt = status === 'completed' ? 'CURRENT_TIMESTAMP' : null;
    const pointsToAward = status === 'completed' ? assignmentPoints : 0;
    
    if (progressResult.rows.length === 0) {
      // Create new progress
      result = await pool.query(
        `INSERT INTO user_progress 
         (user_id, assignment_id, status, code, score, completed_at) 
         VALUES ($1, $2, $3, $4, $5, ${completedAt}) 
         RETURNING *`,
        [userId, assignmentId, status, code || '', pointsToAward]
      );
    } else {
      // Update existing progress
      result = await pool.query(
        `UPDATE user_progress 
         SET status = $1, code = $2, score = $3, completed_at = ${completedAt}, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $4 AND assignment_id = $5 
         RETURNING *`,
        [
          status, 
          code || progressResult.rows[0].code || '', 
          status === 'completed' ? pointsToAward : (score || progressResult.rows[0].score || 0), 
          userId, 
          assignmentId
        ]
      );
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 