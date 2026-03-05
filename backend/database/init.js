require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'football_news.db');
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

console.log('🚀 Initializing database...');

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err.message);
    } else {
      console.log('✅ Users table created');
    }
  });

  // Create articles table
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      author TEXT,
      source TEXT,
      source_url TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      published_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating articles table:', err.message);
    } else {
      console.log('✅ Articles table created');
    }
  });

  // Create indexes for articles
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating category index:', err.message);
    } else {
      console.log('✅ Category index created');
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating published index:', err.message);
    } else {
      console.log('✅ Published index created');
    }
  });

  // Create comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      article_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating comments table:', err.message);
    } else {
      console.log('✅ Comments table created');
    }
  });

  // Create index for comments
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating comments index:', err.message);
    } else {
      console.log('✅ Comments index created');
    }
  });

  // Create favorites table
  db.run(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      article_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      UNIQUE(user_id, article_id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating favorites table:', err.message);
    } else {
      console.log('✅ Favorites table created');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err.message);
  } else {
    console.log('✅ Database initialization complete!');
  }
});
