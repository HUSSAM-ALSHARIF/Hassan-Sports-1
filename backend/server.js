require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route modules
const authRoutes = require('./routes/auth');
const articlesRoutes = require('./routes/articles');
const commentsRoutes = require('./routes/comments');
const favoritesRoutes = require('./routes/favorites');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// Import services
const newsScheduler = require('./services/newsScheduler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'Internal Server Error';
  let errorType = err.name || 'Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'Validation Error';
  } else if (err.name === 'UnauthorizedError' || err.message.includes('authentication') || err.message.includes('token')) {
    statusCode = 401;
    errorType = 'Authentication Error';
  } else if (err.message.includes('authorization') || err.message.includes('admin') || err.message.includes('permission')) {
    statusCode = 403;
    errorType = 'Authorization Error';
  } else if (err.message.includes('not found') || err.code === 'ENOENT') {
    statusCode = 404;
    errorType = 'Not Found';
  } else if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint') || err.message.includes('duplicate')) {
    statusCode = 409;
    errorType = 'Conflict Error';
  }

  // Return consistent error response format
  res.status(statusCode).json({
    error: errorType,
    message: errorMessage
  });
});

// Start news scheduler
newsScheduler.start();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📰 News scheduler active`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down gracefully...');
  newsScheduler.stop();
  process.exit(0);
});
