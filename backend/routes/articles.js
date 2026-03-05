const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get paginated articles with filters
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const search = req.query.search;
  const timeFilter = req.query.time;
  const sportType = req.query.sportType;

  console.log('📊 Articles API called with filters:', { sportType, category, search, timeFilter, page });

  let query = 'SELECT * FROM articles WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE 1=1';
  const params = [];
  const countParams = [];

  // Sport type filter
  if (sportType && sportType !== 'all' && sportType !== '') {
    console.log('  ✓ Adding sport_type filter:', sportType);
    query += ' AND sport_type = ?';
    countQuery += ' AND sport_type = ?';
    params.push(sportType);
    countParams.push(sportType);
  }

  // Category filter
  if (category && category !== 'all' && category !== '') {
    console.log('  ✓ Adding category filter:', category);
    query += ' AND category = ?';
    countQuery += ' AND category = ?';
    params.push(category);
    countParams.push(category);
  }

  // Search filter
  if (search) {
    query += ' AND (title LIKE ? OR content LIKE ?)';
    countQuery += ' AND (title LIKE ? OR content LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
    countParams.push(searchTerm, searchTerm);
  }

  // Time filter
  if (timeFilter) {
    let timeCondition = '';
    if (timeFilter === 'today') {
      timeCondition = " AND date(published_at) = date('now')";
    } else if (timeFilter === 'week') {
      timeCondition = " AND published_at >= datetime('now', '-7 days')";
    } else if (timeFilter === 'month') {
      timeCondition = " AND published_at >= datetime('now', '-30 days')";
    }
    query += timeCondition;
    countQuery += timeCondition;
  }

  query += ' ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  console.log('  📝 Final query:', query);
  console.log('  📝 Params:', params);

  // Get total count
  db.get(countQuery, countParams, (err, countResult) => {
    if (err) {
      console.error('  ❌ Count query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const totalCount = countResult.total;
    const totalPages = Math.ceil(totalCount / limit);
    console.log(`  ✓ Found ${totalCount} total articles`);

    // Get articles
    db.all(query, params, (err, articles) => {
      if (err) {
        console.error('  ❌ Articles query error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`  ✓ Returning ${articles.length} articles`);
      if (articles.length > 0) {
        console.log(`  ✓ First article: [${articles[0].sport_type}] ${articles[0].title.substring(0, 40)}...`);
      }

      res.json({
        articles,
        totalCount,
        totalPages,
        currentPage: page,
        hasMore: page < totalPages
      });
    });
  });
});

// Get single article by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, article) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article });
  });
});

// Get related articles
router.get('/:id/related', (req, res) => {
  const { id } = req.params;

  // First get the article's category
  db.get('SELECT category FROM articles WHERE id = ?', [id], (err, article) => {
    if (err || !article) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get related articles from same category
    db.all(
      'SELECT * FROM articles WHERE category = ? AND id != ? ORDER BY published_at DESC LIMIT 5',
      [article.category, id],
      (err, articles) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ articles });
      }
    );
  });
});

module.exports = router;
