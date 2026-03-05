# Database Update Instructions

## To add the sport_type column to your database:

Run this command in your terminal:

```bash
node backend/database/add_sport_type.js
```

This will:
1. Add a `sport_type` column to the articles table
2. Set default value to 'Soccer' for all existing articles
3. Create an index for better performance

After running this, restart your server with `npm start` and the sport filter will work!

## What's New:

### Sport Type Filter
- Filter articles by sport: Soccer ⚽, American Football 🏈, Basketball 🏀, Baseball ⚾, Tennis 🎾
- Each article now shows its sport type with an icon
- The system automatically detects sport type based on article content

### Sport Type Detection
The system detects:
- **Soccer**: Premier League, La Liga, Champions League, transfers
- **American Football**: NFL teams (Seahawks, Patriots, Cowboys, etc.)
- **Basketball**: NBA teams and players
- **Baseball**: MLB teams
- **Tennis**: Grand Slam tournaments
- **Hockey**: NHL teams

All new articles will be automatically categorized!
