const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.get(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [user_id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  const user_id = req.user.id;

  if (!username && !email) {
    return res.status(400).json({ error: 'At least one field is required' });
  }

  let query = 'UPDATE users SET';
  const params = [];
  const updates = [];

  if (username) {
    updates.push(' username = ?');
    params.push(username);
  }

  if (email) {
    updates.push(' email = ?');
    params.push(email);
  }

  query += updates.join(',') + ' WHERE id = ?';
  params.push(user_id);

  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ message: 'Profile updated successfully' });
  });
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user_id = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Get current password hash
  db.get('SELECT password_hash FROM users WHERE id = ?', [user_id], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, user_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'Password changed successfully' });
      }
    );
  });
});

// Get user's comments
router.get('/comments', authenticateToken, (req, res) => {
  const user_id = req.user.id;

  db.all(
    `SELECT c.*, a.title as article_title 
     FROM comments c 
     JOIN articles a ON c.article_id = a.id 
     WHERE c.user_id = ? 
     ORDER BY c.created_at DESC`,
    [user_id],
    (err, comments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ comments });
    }
  );
});

module.exports = router;
