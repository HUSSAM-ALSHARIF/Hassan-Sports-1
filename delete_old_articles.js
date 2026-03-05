require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️  Deleting articles older than 24 hours...\n');

db.serialize(() => {
  // Delete articles older than 24 hours
  db.run(
    `DELETE FROM articles WHERE published_at < datetime('now', '-24 hours')`,
    function(err) {
      if (err) {
        console.error('❌ Error:', err.message);
        return;
      }
      
      console.log(`✅ Deleted ${this.changes} old articles`);
      
      // Show remaining articles count
      db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        if (err) {
          console.error('❌ Error:', err.message);
        } else {
          console.log(`📊 Remaining articles: ${row.count}`);
        }
        db.close();
      });
    }
  );
});
