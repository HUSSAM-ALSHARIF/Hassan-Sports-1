const axios = require('axios');
const db = require('../config/database');

class NewsAPIFetcher {
  constructor() {
    this.apiKey = process.env.NEWSAPI_KEY;
    this.articlesPerRun = 5; // Per category
  }

  async cleanupOldArticles() {
    return new Promise((resolve, reject) => {
      // Delete articles older than 48 hours to keep database fresh
      db.run(
        `DELETE FROM articles WHERE published_at < datetime('now', '-48 hours')`,
        function(err) {
          if (err) {
            console.error('Error cleaning old articles:', err);
            reject(err);
          } else {
            if (this.changes > 0) {
              console.log(`🗑️  Cleaned up ${this.changes} old articles`);
            }
            resolve(this.changes);
          }
        }
      );
    });
  }

  async fetchAndImport() {
    console.log('🚀 Starting NewsAPI import...');

    // First, clean up old articles (older than 48 hours)
    await this.cleanupOldArticles();

    let totalImported = 0;
    let totalSkipped = 0;

    // Fetch articles for each specific category with SPORTS-ONLY queries
    const categories = [
      { query: '"Premier League" OR "EPL" OR "Manchester United" OR "Liverpool FC" OR "Chelsea FC"', category: 'Premier League', sport: 'Soccer' },
      { query: '"La Liga" OR "Real Madrid" OR "Barcelona" OR "Atletico Madrid" OR "Spanish football"', category: 'La Liga', sport: 'Soccer' },
      { query: '"Champions League" OR "UCL" OR "UEFA Champions League" OR "European football"', category: 'Champions League', sport: 'Soccer' },
      { query: '"football transfer" OR "soccer transfer" OR "transfer news" OR "player signing"', category: 'Transfers', sport: 'Soccer' },
      { query: '"NFL" OR "American Football" OR "Super Bowl" OR "quarterback" OR "touchdown"', category: 'General', sport: 'American Football' },
      { query: '"NBA" OR "basketball" OR "Lakers" OR "Warriors" OR "LeBron James"', category: 'General', sport: 'Basketball' },
      { query: '"MLB" OR "baseball" OR "World Series" OR "Yankees" OR "Dodgers"', category: 'General', sport: 'Baseball' },
      { query: '"tennis" OR "Wimbledon" OR "US Open" OR "Grand Slam" OR "ATP"', category: 'General', sport: 'Tennis' }
    ];

    for (const categoryConfig of categories) {
      try {
        const { imported, skipped } = await this.fetchCategory(
          categoryConfig.query, 
          categoryConfig.category,
          categoryConfig.sport
        );
        totalImported += imported;
        totalSkipped += skipped;
      } catch (error) {
        console.error(`Error fetching ${categoryConfig.category}:`, error.message);
      }
    }

    console.log(`✅ Total import complete! Imported: ${totalImported}, Skipped: ${totalSkipped}`);
    return { imported: totalImported, skipped: totalSkipped };
  }

  async fetchCategory(query, forcedCategory, forcedSportType) {
    try {
      // Get articles from the last 12 hours only
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));
      const fromDate = twelveHoursAgo.toISOString();
      
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          from: fromDate,
          pageSize: this.articlesPerRun,
          apiKey: this.apiKey,
          domains: 'espn.com,bbc.com/sport,skysports.com,goal.com,theguardian.com/sport,si.com,bleacherreport.com,cbssports.com,nbcsports.com,foxsports.com'
        }
      });

      const articles = response.data.articles;
      let imported = 0;
      let skipped = 0;

      for (const article of articles) {
        if (!article.url || !article.title) {
          skipped++;
          continue;
        }

        // Skip non-sports articles
        if (!this.isSportsArticle(article.title, article.description || '', article.content || '')) {
          console.log(`  ⊘ Skipping non-sports: ${article.title.substring(0, 50)}...`);
          skipped++;
          continue;
        }

        // Check if article already exists
        const exists = await this.checkDuplicate(article.url);
        if (exists) {
          skipped++;
          continue;
        }

        // Use forced category and sport type
        const category = forcedCategory || this.detectCategory(article.title, article.description || '');
        const sportType = forcedSportType || this.detectSportType(article.title, article.description || '', article.content || '');

        // Insert article
        try {
          await this.insertArticle({
            title: article.title,
            content: article.description || article.content || 'No content available',
            image: article.urlToImage,
            author: article.author,
            source: article.source.name,
            source_url: article.url,
            category: category,
            sport_type: sportType,
            published_at: article.publishedAt
          });
          imported++;
          console.log(`  ✓ Imported [${sportType}]: ${article.title.substring(0, 50)}...`);
        } catch (err) {
          console.error('Error inserting article:', err.message);
          skipped++;
        }
      }

      console.log(`  ${forcedCategory} (${forcedSportType}): Imported ${imported}, Skipped ${skipped}`);
      return { imported, skipped };
    } catch (error) {
      console.error(`Error fetching category ${forcedCategory}:`, error.message);
      return { imported: 0, skipped: 0 };
    }
  }

  isSportsArticle(title, description, content) {
    const text = (title + ' ' + description + ' ' + content).toLowerCase();
    
    // Non-sports keywords that indicate it's NOT a sports article (CHECK FIRST)
    const nonSportsKeywords = [
      'chatgpt', 'openai', 'artificial intelligence', 'real estate', 'property',
      'stock market', 'cryptocurrency', 'bitcoin', 'politics', 'election',
      'video game', 'gaming', 'movie', 'film', 'music', 'concert', 'album',
      'restaurant', 'recipe', 'cooking', 'fashion', 'style', 'beauty',
      // Low-quality sports content
      'betting', 'odds', 'parlay', 'sportsbook', 'wager', 'gamble', 'best bets',
      'how to watch', 'live stream', 'prediction', 'preview',
      'high school', 'college football', 'ncaa football', 'recruiting',
      'fantasy', 'draft picks', 'mock draft', 'sleepers'
    ];
    
    // Check for non-sports keywords first
    for (const keyword of nonSportsKeywords) {
      if (text.includes(keyword)) {
        return false;
      }
    }
    
    // Sports keywords that MUST be present
    const sportsKeywords = [
      // Soccer
      'soccer', 'football', 'premier league', 'la liga', 'champions league', 'fifa', 'uefa',
      'messi', 'ronaldo', 'goal', 'striker', 'midfielder', 'defender', 'goalkeeper',
      // American Football
      'nfl', 'quarterback', 'touchdown', 'super bowl', 'patriots', 'cowboys', 'seahawks',
      // Basketball
      'nba', 'basketball', 'lakers', 'warriors', 'lebron', 'curry', 'dunk',
      // Baseball
      'mlb', 'baseball', 'yankees', 'dodgers', 'world series', 'pitcher', 'homerun',
      // Tennis
      'tennis', 'wimbledon', 'us open', 'french open', 'australian open', 'atp', 'wta',
      // General sports
      'player', 'team', 'coach', 'match', 'game', 'season', 'league', 'championship',
      'tournament', 'playoff', 'athlete', 'sport'
    ];
    
    // Check for sports keywords
    for (const keyword of sportsKeywords) {
      if (text.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  detectSportType(title, description, content) {
    const text = (title + ' ' + description + ' ' + content).toLowerCase();

    // American Football - CHECK FIRST (highest priority)
    const nflPlayers = ['kyler murray', 'breece hall', 'daniel jones', 'patrick mahomes', 
                        'josh allen', 'joe burrow', 'lamar jackson', 'tom brady', 
                        'aaron rodgers', 'stefon diggs', 'damar hamlin', 'kenneth walker',
                        'dak prescott', 'brandon aubrey'];
    
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

    // Basketball keywords
    if (text.includes('nba') || text.includes('lakers') || text.includes('warriors') ||
        text.includes('basketball') || text.includes('lebron') || text.includes('curry') ||
        text.includes('celtics') || text.includes('knicks') || text.includes('bulls') ||
        text.includes('wnba')) {
      return 'Basketball';
    }

    // Baseball keywords
    if (text.includes('mlb') || text.includes('yankees') || text.includes('dodgers') ||
        text.includes('baseball') || text.includes('world series') || text.includes('red sox') ||
        text.includes('mets') || text.includes('cubs') || text.includes('world baseball classic')) {
      return 'Baseball';
    }

    // Hockey keywords
    if (text.includes('nhl') || text.includes('hockey') || text.includes('stanley cup')) {
      return 'Hockey';
    }

    // Tennis keywords
    if (text.includes('tennis') || text.includes('wimbledon') || text.includes('us open') ||
        text.includes('french open') || text.includes('australian open') || text.includes('atp') ||
        text.includes('wta') || text.includes('rybakina')) {
      return 'Tennis';
    }

    // Soccer - check for soccer-specific keywords
    const soccerKeywords = ['soccer', 'premier league', 'la liga', 'champions league', 'uefa',
                           'barcelona', 'real madrid', 'manchester united', 'liverpool', 'chelsea',
                           'arsenal', 'manchester city', 'tottenham', 'messi', 
                           'ronaldo', 'epl', 'ucl', 'atletico', 'sevilla', 'valencia',
                           'joao pedro', 'summerville', 'osula', 'newcastle united'];
    
    for (const keyword of soccerKeywords) {
      if (text.includes(keyword)) {
        return 'Soccer';
      }
    }

    // Only return Soccer for generic "football" if it's clearly not American Football
    if (text.includes('football') && !text.includes('nfl')) {
      return 'Soccer';
    }

    // Default to Soccer
    return 'Soccer';
  }

  checkDuplicate(url) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id FROM articles WHERE source_url = ?', [url], (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      });
    });
  }

  detectCategory(title, content) {
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

  insertArticle(article) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO articles (title, content, image, author, source, source_url, category, sport_type, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.title,
          article.content,
          article.image,
          article.author,
          article.source,
          article.source_url,
          article.category,
          article.sport_type || 'Soccer',
          article.published_at
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }
}

module.exports = new NewsAPIFetcher().fetchAndImport.bind(new NewsAPIFetcher());
