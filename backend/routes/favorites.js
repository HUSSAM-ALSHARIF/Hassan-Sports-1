const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user's favorites
router.get('/', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all(
    `SELECT a.*, f.created_at as favorited_at 
     FROM favorites f 
     JOIN articles a ON f.article_id = a.id 
     WHERE f.user_id = ? 
     ORDER BY f.created_at DESC`,
    [user_id],
    (err, favorites) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ favorites });
    }
  );
});

// Add article to favorites
router.post('/', authenticateToken, (req, res) => {
  const { article_id } = req.body;
  const user_id = req.user.id;

  if (!article_id) {
    return res.status(400).json({ error: 'Article ID is required' });
  }

  db.run(
    'INSERT INTO favorites (user_id, article_id) VALUES (?, ?)',
    [user_id, article_id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Article already in favorites' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'Article added to favorites' });
    }
  );
});

// Remove article from favorites
router.delete('/:articleId', authenticateToken, (req, res) => {
  const { articleId } = req.params;
  const user_id = req.user.id;

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND article_id = ?',
    [user_id, articleId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ message: 'Article removed from favorites' });
    }
  );
});

module.exports = router;
