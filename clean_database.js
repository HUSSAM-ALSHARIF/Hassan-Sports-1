require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning non-sports articles from database...\n');

const nonSportsKeywords = [
  'chatgpt', 'openai', 'artificial intelligence', 'ai', 'real estate', 'property',
  'stock market', 'cryptocurrency', 'bitcoin', 'politics', 'election',
  'video game', 'gaming', 'ninja gaiden', 'movie', 'film', 'music', 'concert',
  'restaurant', 'recipe', 'cooking', 'fashion', 'style', 'beauty', 'business',
  'technology', 'software', 'app', 'iphone', 'android', 'nyc', 'apartment'
];

db.serialize(() => {
  // Get all articles
  db.all('SELECT id, title, content FROM articles', [], (err, articles) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }

    console.log(`📊 Checking ${articles.length} articles...\n`);
    
    let deleted = 0;
    let kept = 0;
    const toDelete = [];

    articles.forEach((article) => {
      const text = (article.title + ' ' + article.content).toLowerCase();
      let isNonSports = false;

      for (const keyword of nonSportsKeywords) {
        if (text.includes(keyword)) {
          isNonSports = true;
          console.log(`❌ DELETE: "${article.title.substring(0, 60)}..." (contains: ${keyword})`);
          toDelete.push(article.id);
          deleted++;
          break;
        }
      }

      if (!isNonSports) {
        kept++;
      }
    });

    console.log(`\n📊 Summary: ${deleted} to delete, ${kept} to keep\n`);

    if (toDelete.length > 0) {
      const placeholders = toDelete.map(() => '?').join(',');
      db.run(`DELETE FROM articles WHERE id IN (${placeholders})`, toDelete, (err) => {
        if (err) {
          console.error('❌ Error deleting:', err.message);
        } else {
          console.log(`✅ Deleted ${toDelete.length} non-sports articles`);
        }
        db.close();
      });
    } else {
      console.log('✅ No non-sports articles found');
      db.close();
    }
  });
});
