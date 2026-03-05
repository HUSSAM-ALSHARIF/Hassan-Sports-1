require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'backend/database/football_news.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database...\n');

db.all('SELECT id, title, sport_type FROM articles LIMIT 10', [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  
  console.log('Sample articles:');
  rows.forEach(row => {
    console.log(`${row.id}. [${row.sport_type || 'NULL'}] ${row.title.substring(0, 60)}...`);
  });
  
  db.all('SELECT sport_type, COUNT(*) as count FROM articles GROUP BY sport_type', [], (err, counts) => {
    if (err) {
      console.error('Error:', err.message);
      return;
    }
    
    console.log('\nSport type distribution:');
    counts.forEach(row => {
      console.log(`  ${row.sport_type || 'NULL'}: ${row.count} articles`);
    });
    
    db.close();
  });
});
