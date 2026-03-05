const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const fetchNewsApiArticles = require('../services/fetchNewsApiArticles');

// Get all users
router.get('/users', authenticateToken, isAdmin, (req, res) => {
  db.all(
    'SELECT id, username, email, is_admin, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ users });
    }
  );
});

// Delete user
router.delete('/users/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// Toggle admin role
router.put('/users/:id/toggle-admin', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT is_admin FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newAdminStatus = user.is_admin === 1 ? 0 : 1;

    db.run('UPDATE users SET is_admin = ? WHERE id = ?', [newAdminStatus, id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ 
        message: 'Admin status updated', 
        isAdmin: newAdminStatus === 1 
      });
    });
  });
});

// Get pending comments
router.get('/comments/pending', authenticateToken, isAdmin, (req, res) => {
  db.all(
    `SELECT c.*, u.username, a.title as article_title 
     FROM comments c 
     JOIN users u ON c.user_id = u.id 
     JOIN articles a ON c.article_id = a.id 
     WHERE c.approved = 0 
     ORDER BY c.created_at DESC`,
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ comments });
    }
  );
});

// Approve comment
router.put('/comments/:id/approve', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.run('UPDATE comments SET approved = 1 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment approved successfully' });
  });
});

// Delete comment (admin)
router.delete('/comments/:id', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  });
});

// Manual news import
router.post('/scrape', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await fetchNewsApiArticles();
    res.json({ 
      message: 'News import completed', 
      imported: result.imported,
      skipped: result.skipped
    });
  } catch (error) {
    res.status(500).json({ error: 'Import failed', message: error.message });
  }
});

// Get system statistics
router.get('/stats', authenticateToken, isAdmin, (req, res) => {
  const stats = {};

  // Get total users
  db.get('SELECT COUNT(*) as total FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalUsers = result.total;

    // Get total articles
    db.get('SELECT COUNT(*) as total FROM articles', (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalArticles = result.total;

      // Get total comments
      db.get('SELECT COUNT(*) as total FROM comments', (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.totalComments = result.total;

        // Get pending comments
        db.get('SELECT COUNT(*) as total FROM comments WHERE approved = 0', (err, result) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.pendingComments = result.total;

          res.json({ stats });
        });
      });
    });
  });
});

module.exports = router;
