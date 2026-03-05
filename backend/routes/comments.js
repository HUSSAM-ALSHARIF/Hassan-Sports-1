const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get comments for an article
router.get('/article/:articleId', (req, res) => {
  const { articleId } = req.params;
  const isAdmin = req.user && req.user.is_admin;

  let query = 'SELECT * FROM comments WHERE article_id = ?';
  if (!isAdmin) {
    query += ' AND approved = 1';
  }
  query += ' ORDER BY created_at DESC';

  db.all(query, [articleId], (err, comments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ comments });
  });
});

// Post a new comment
router.post('/', authenticateToken, (req, res) => {
  const { article_id, comment } = req.body;
  const user_id = req.user.id;
  const name = req.user.username;

  if (!article_id || !comment) {
    return res.status(400).json({ error: 'Article ID and comment are required' });
  }

  db.run(
    'INSERT INTO comments (user_id, name, article_id, comment, approved) VALUES (?, ?, ?, ?, 0)',
    [user_id, name, article_id, comment],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ 
        message: 'Comment submitted for approval', 
        commentId: this.lastID 
      });
    }
  );
});

// Delete own comment
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const is_admin = req.user.is_admin;

  // Check if user owns the comment or is admin
  db.get('SELECT * FROM comments WHERE id = ?', [id], (err, comment) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.user_id !== user_id && !is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    db.run('DELETE FROM comments WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Comment deleted successfully' });
    });
  });
});

module.exports = router;
