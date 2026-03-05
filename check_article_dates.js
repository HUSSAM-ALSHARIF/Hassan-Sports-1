require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('📅 Checking article dates...\n');

db.serialize(() => {
  db.all(
    `SELECT id, title, published_at, sport_type 
     FROM articles 
     ORDER BY published_at DESC 
     LIMIT 10`,
    [],
    (err, articles) => {
      if (err) {
        console.error('❌ Error:', err.message);
        return;
      }

      console.log(`📊 Latest ${articles.length} articles:\n`);
      
      articles.forEach((article) => {
        const publishedDate = new Date(article.published_at);
        const now = new Date();
        const diffHours = Math.floor((now - publishedDate) / (1000 * 60 * 60));
        
        console.log(`${article.id}. [${article.sport_type}] ${article.title.substring(0, 50)}...`);
        console.log(`   Published: ${publishedDate.toLocaleString('en-US', { 
          timeZone: 'Asia/Riyadh',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })} (${diffHours} hours ago)`);
        console.log('');
      });
      
      db.close();
    }
  );
});
