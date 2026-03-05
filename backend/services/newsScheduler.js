const cron = require('node-cron');
const fetchNewsApiArticles = require('./fetchNewsApiArticles');

class NewsScheduler {
  constructor() {
    this.job = null;
    this.isRunning = false;
  }

  start() {
    // Run immediately on startup
    this.runImport();

    // Schedule to run every 2 hours (to stay within NewsAPI free tier limits)
    // Free tier: 100 requests/day, we make 8 requests per run = 12 runs per day max
    this.job = cron.schedule('0 */2 * * *', () => {
      this.runImport();
    });

    console.log('📅 News scheduler started');
    console.log('⏰ Will run every 2 hours (to stay within API limits)');
  }

  async runImport() {
    if (this.isRunning) {
      console.log('⏭️  Import already running, skipping...');
      return;
    }

    this.isRunning = true;
    try {
      await fetchNewsApiArticles();
    } catch (error) {
      console.error('❌ Import failed:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  stop() {
    if (this.job) {
      this.job.stop();
      console.log('⏹️  Scheduler stopped');
    }
  }
}

module.exports = new NewsScheduler();
