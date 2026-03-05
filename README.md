# Football News Website

A production-ready football news aggregation platform that automatically imports, categorizes, and displays football news articles.

## Features

- Automatic news import from NewsAPI every 5 minutes
- User authentication with JWT tokens
- Article browsing with pagination, filtering, and search
- Comments system with admin moderation
- Favorites management
- Admin panel for user and content management
- Dark/light theme toggle
- Responsive design for mobile, tablet, and desktop

## Technology Stack

- **Backend**: Node.js + Express.js + SQLite3
- **Authentication**: JWT + bcryptjs
- **Scheduler**: node-cron
- **Frontend**: HTML5 + Tailwind CSS + Vanilla JavaScript + GSAP
- **External API**: NewsAPI

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
npm run init-db
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3000
JWT_SECRET=your_secure_random_string
DB_PATH=./backend/database/football_news.db
NEWSAPI_KEY=your_newsapi_key
NODE_ENV=development
```

## Project Structure

```
football-news-website/
├── backend/
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── css/
│   ├── js/
│   └── *.html
├── .env
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Articles
- GET /api/articles - Get paginated articles
- GET /api/articles/:id - Get article details
- GET /api/articles/:id/related - Get related articles

### Comments
- GET /api/comments/article/:articleId - Get article comments
- POST /api/comments - Post comment (auth required)
- DELETE /api/comments/:id - Delete comment (auth required)

### Favorites
- GET /api/favorites - Get user favorites (auth required)
- POST /api/favorites - Add favorite (auth required)
- DELETE /api/favorites/:articleId - Remove favorite (auth required)

### User Profile
- GET /api/user/profile - Get user profile (auth required)
- PUT /api/user/profile - Update profile (auth required)
- PUT /api/user/password - Change password (auth required)
- GET /api/user/comments - Get user comments (auth required)

### Admin
- GET /api/admin/users - Get all users (admin only)
- DELETE /api/admin/users/:id - Delete user (admin only)
- GET /api/admin/comments/pending - Get pending comments (admin only)
- PUT /api/admin/comments/:id/approve - Approve comment (admin only)
- DELETE /api/admin/comments/:id - Delete comment (admin only)
- POST /api/admin/scrape - Manually trigger news import (admin only)
- GET /api/admin/stats - Get system statistics (admin only)

## License

MIT
