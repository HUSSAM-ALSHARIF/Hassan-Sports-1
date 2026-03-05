require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🧹 Cleaning bad articles from database...\n');

// Keywords that indicate low-quality or non-sports articles
const badKeywords = [
  'betting', 'odds', 'parlay', 'sportsbook', 'wager', 'gamble',
  'high school', 'college football', 'ncaa football', 'recruiting',
  'fantasy', 'draft picks', 'mock draft',
  'how to watch', 'live stream', 'tv schedule',
  'prediction', 'preview', 'best bets',
  'msu football', 'carrollton', 'whiteland', 'cascade', 'tssaa', 'ihsaa',
  'yale som', 'scout reveals', 'agent take'
];

db.serialize(() => {
  db.all('SELECT id, title, content, sport_type, category FROM articles', [], (err, articles) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }

    console.log(`📊 Analyzing ${articles.length} articles...\n`);
    
    let deleted = 0;
    let processed = 0;

    articles.forEach((article) => {
      const text = (article.title + ' ' + article.content).toLowerCase();
      let shouldDelete = false;
      let reason = '';

      // Check for bad keywords
      for (const keyword of badKeywords) {
        if (text.includes(keyword)) {
          shouldDelete = true;
          reason = `Contains: ${keyword}`;
          break;
        }
      }

      // Delete articles marked as "General" sport type (usually not proper sports news)
      if (article.sport_type === 'General' && !shouldDelete) {
        shouldDelete = true;
        reason = 'Sport type: General';
      }

      if (shouldDelete) {
        db.run('DELETE FROM articles WHERE id = ?', [article.id], (err) => {
          processed++;
          
          if (err) {
            console.error(`❌ Error deleting article ${article.id}:`, err.message);
          } else {
            deleted++;
            console.log(`✗ ${article.id}. "${article.title.substring(0, 60)}..."`);
            console.log(`   Reason: ${reason}\n`);
          }

          if (processed === articles.length) {
            console.log(`\n✅ Complete! Deleted ${deleted} articles`);
            console.log(`📊 Remaining: ${articles.length - deleted} articles`);
            db.close();
          }
        });
      } else {
        processed++;
        if (processed === articles.length) {
          console.log(`\n✅ Complete! Deleted ${deleted} articles`);
          console.log(`📊 Remaining: ${articles.length - deleted} articles`);
          db.close();
        }
      }
    });
  });
});
