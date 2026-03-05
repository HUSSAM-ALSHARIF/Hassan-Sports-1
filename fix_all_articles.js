require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing all article categories and sport types...\n');

function detectSportType(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    // American Football - CHECK FIRST (highest priority)
    const nflPlayers = ['kyler murray', 'breece hall', 'daniel jones', 'patrick mahomes', 
                        'josh allen', 'joe burrow', 'lamar jackson', 'tom brady', 
                        'aaron rodgers', 'stefon diggs', 'damar hamlin'];
    
    const nflKeywords = ['nfl', 'quarterback', 'qb', 'touchdown', 'super bowl', 'american football'];
    
    // Check NFL players first (very specific)
    for (const player of nflPlayers) {
      if (text.includes(player)) {
        return 'American Football';
      }
    }
    
    // Check NFL keywords
    for (const keyword of nflKeywords) {
      if (text.includes(keyword)) {
        return 'American Football';
      }
    }
    
    // Check NFL teams (but exclude if soccer context)
    const nflTeams = ['cardinals', 'falcons', 'ravens', 'bills', 'panthers', 'bears', 'bengals', 
                      'browns', 'cowboys', 'broncos', 'lions', 'packers', 'texans', 'colts', 
                      'jaguars', 'chiefs', 'raiders', 'chargers', 'rams', 'dolphins', 'vikings',
                      'patriots', 'saints', 'giants', 'jets', 'eagles', 'steelers', '49ers',
                      'seahawks', 'buccaneers', 'titans', 'commanders'];
    
    for (const team of nflTeams) {
      if (text.includes(team) && !text.includes('soccer') && !text.includes('premier league') && !text.includes('la liga')) {
        return 'American Football';
      }
    }

    // Basketball
    if (text.includes('nba') || text.includes('lakers') || text.includes('warriors') ||
        text.includes('basketball') || text.includes('lebron') || text.includes('curry') ||
        text.includes('celtics') || text.includes('knicks') || text.includes('bulls')) {
      return 'Basketball';
    }

    // Baseball
    if (text.includes('mlb') || text.includes('yankees') || text.includes('dodgers') ||
        text.includes('baseball') || text.includes('world series') || text.includes('red sox') ||
        text.includes('mets') || text.includes('cubs')) {
      return 'Baseball';
    }

    // Tennis
    if (text.includes('tennis') || text.includes('wimbledon') || text.includes('us open') ||
        text.includes('french open') || text.includes('australian open') || text.includes('atp') ||
        text.includes('wta')) {
      return 'Tennis';
    }

    // Soccer - check for soccer-specific keywords
    const soccerKeywords = ['soccer', 'premier league', 'la liga', 'champions league', 'uefa',
                           'barcelona', 'real madrid', 'manchester united', 'liverpool', 'chelsea',
                           'arsenal', 'manchester city', 'tottenham', 'messi', 
                           'ronaldo', 'epl', 'ucl', 'atletico', 'sevilla', 'valencia'];
    
    for (const keyword of soccerKeywords) {
      if (text.includes(keyword)) {
        return 'Soccer';
      }
    }

    // Only return Soccer for generic "football" if it's clearly not American Football
    if (text.includes('football') && !text.includes('nfl')) {
      return 'Soccer';
    }

    return 'General';
}

function detectCategory(title, content) {
    const text = (title + ' ' + content).toLowerCase();

    // Premier League - MUST have explicit mention
    if (text.includes('premier league') || text.includes('epl')) {
      return 'Premier League';
    }
    
    // Check for Premier League teams ONLY if "premier league" context exists
    const plTeams = ['manchester united', 'liverpool', 'chelsea', 'arsenal', 
                     'manchester city', 'tottenham', 'newcastle', 'brighton', 
                     'aston villa', 'west ham', 'everton', 'leicester'];
    
    for (const team of plTeams) {
      if (text.includes(team) && (text.includes('premier') || text.includes('epl'))) {
        return 'Premier League';
      }
    }

    // La Liga - MUST have explicit mention
    if (text.includes('la liga') || text.includes('spanish league')) {
      return 'La Liga';
    }
    
    // Check for La Liga teams ONLY if "la liga" context exists
    const laLigaTeams = ['real madrid', 'barcelona', 'atletico madrid', 'sevilla', 
                         'valencia', 'athletic bilbao', 'real sociedad', 'villarreal'];
    
    for (const team of laLigaTeams) {
      if (text.includes(team) && (text.includes('la liga') || text.includes('spanish'))) {
        return 'La Liga';
      }
    }

    // Champions League - MUST have explicit mention
    if (text.includes('champions league') || text.includes('ucl') || 
        (text.includes('uefa') && text.includes('champions'))) {
      return 'Champions League';
    }

    // Transfers - soccer transfers only
    if ((text.includes('transfer') || text.includes('signing')) && 
        (text.includes('soccer') || text.includes('football') || text.includes('premier') || 
         text.includes('la liga') || text.includes('barcelona') || text.includes('manchester'))) {
      return 'Transfers';
    }

    return 'General';
}

db.serialize(() => {
  db.all('SELECT id, title, content, category, sport_type FROM articles', [], (err, articles) => {
    if (err) {
      console.error('❌ Error:', err.message);
      return;
    }

    console.log(`📊 Analyzing ${articles.length} articles...\n`);
    
    let updated = 0;
    let processed = 0;

    articles.forEach((article) => {
      const newSportType = detectSportType(article.title, article.content);
      const newCategory = detectCategory(article.title, article.content);
      
      const sportChanged = newSportType !== article.sport_type;
      const categoryChanged = newCategory !== article.category;

      if (sportChanged || categoryChanged) {
        db.run(
          'UPDATE articles SET sport_type = ?, category = ? WHERE id = ?',
          [newSportType, newCategory, article.id],
          (err) => {
            processed++;
            
            if (err) {
              console.error(`❌ Error updating article ${article.id}:`, err.message);
            } else {
              updated++;
              console.log(`✓ ${article.id}. "${article.title.substring(0, 50)}..."`);
              if (sportChanged) {
                console.log(`   Sport: ${article.sport_type} → ${newSportType}`);
              }
              if (categoryChanged) {
                console.log(`   Category: ${article.category} → ${newCategory}`);
              }
            }

            if (processed === articles.length) {
              console.log(`\n✅ Complete! Updated ${updated} articles`);
              db.close();
            }
          }
        );
      } else {
        processed++;
        if (processed === articles.length) {
          console.log(`\n✅ Complete! Updated ${updated} articles`);
          db.close();
        }
      }
    });
  });
});
