require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Updating sport types for existing articles...');

function detectSportType(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    // American Football keywords
    if (text.includes('nfl') || text.includes('seahawks') || text.includes('patriots') || 
        text.includes('cowboys') || text.includes('touchdown') || text.includes('quarterback') ||
        text.includes('super bowl') || text.includes('chiefs') || text.includes('rams') ||
        text.includes('packers') || text.includes('49ers') || text.includes('ravens') ||
        text.includes('mcduffie') || text.includes('howell') || text.includes('lawrence')) {
      return 'American Football';
    }

    // Basketball keywords
    if (text.includes('nba') || text.includes('lakers') || text.includes('warriors') ||
        text.includes('basketball') || text.includes('lebron') || text.includes('curry')) {
      return 'Basketball';
    }

    // Baseball keywords
    if (text.includes('mlb') || text.includes('yankees') || text.includes('dodgers') ||
        text.includes('baseball') || text.includes('world series')) {
      return 'Baseball';
    }

    // Hockey keywords
    if (text.includes('nhl') || text.includes('hockey') || text.includes('stanley cup')) {
      return 'Hockey';
    }

    // Tennis keywords
    if (text.includes('tennis') || text.includes('wimbledon') || text.includes('us open') ||
        text.includes('french open') || text.includes('australian open')) {
      return 'Tennis';
    }

    // Soccer keywords
    if (text.includes('premier league') || text.includes('la liga') || text.includes('champions league') ||
        text.includes('messi') || text.includes('ronaldo') || text.includes('barcelona') ||
        text.includes('real madrid') || text.includes('manchester') || text.includes('liverpool') ||
        text.includes('chelsea') || text.includes('arsenal') || text.includes('transfer')) {
      return 'Soccer';
    }

    // Default to General if can't determine
    return 'General';
}

db.serialize(() => {
  // Get all articles
  db.all('SELECT id, title, content FROM articles', [], (err, articles) => {
    if (err) {
      console.error('❌ Error fetching articles:', err.message);
      return;
    }

    console.log(`📊 Found ${articles.length} articles to update`);
    
    let updated = 0;
    let processed = 0;

    articles.forEach((article) => {
      const sportType = detectSportType(article.title, article.content);
      
      db.run(
        'UPDATE articles SET sport_type = ? WHERE id = ?',
        [sportType, article.id],
        (err) => {
          processed++;
          
          if (err) {
            console.error(`❌ Error updating article ${article.id}:`, err.message);
          } else {
            updated++;
            if (sportType !== 'Soccer') {
              console.log(`  ✓ Article ${article.id}: "${article.title.substring(0, 50)}..." → ${sportType}`);
            }
          }

          // When all articles are processed
          if (processed === articles.length) {
            console.log(`\n✅ Update complete! Updated ${updated} articles`);
            db.close();
          }
        }
      );
    });
  });
});
