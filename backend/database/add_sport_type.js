require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Adding sport_type column to articles table...');

db.serialize(() => {
  // Add sport_type column if it doesn't exist
  db.run(`
    ALTER TABLE articles ADD COLUMN sport_type TEXT DEFAULT 'Soccer'
  `, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ sport_type column already exists');
      } else {
        console.error('❌ Error adding sport_type column:', err.message);
      }
    } else {
      console.log('✅ sport_type column added successfully');
    }
  });

  // Create index for sport_type
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_articles_sport_type ON articles(sport_type)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating sport_type index:', err.message);
    } else {
      console.log('✅ sport_type index created');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err.message);
  } else {
    console.log('✅ Database update complete!');
  }
});
