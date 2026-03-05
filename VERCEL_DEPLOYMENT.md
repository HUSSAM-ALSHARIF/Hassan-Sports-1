# Deploying Hassan News to Vercel

## ⚠️ IMPORTANT: Limitations with Vercel

### The Problem:
Vercel is designed for **serverless functions**, NOT for long-running processes. Your news scheduler that runs every 5 minutes **WILL NOT WORK** on Vercel because:

1. **No Background Jobs**: Vercel doesn't support background processes or cron jobs in the free tier
2. **Serverless Functions**: Each request creates a new instance that dies after the response
3. **SQLite Database**: Vercel's filesystem is read-only, so your SQLite database won't persist between deployments

### What WILL Work on Vercel:
- ✅ Frontend (HTML, CSS, JavaScript)
- ✅ API endpoints (but only when called by users)
- ✅ Reading existing articles from database

### What WON'T Work on Vercel:
- ❌ Automatic news import every 5 minutes
- ❌ SQLite database updates
- ❌ Background scheduler

---

## 🎯 RECOMMENDED FREE ALTERNATIVES

### Option 1: Railway.app (BEST FOR YOUR PROJECT)
**Why Railway is better:**
- ✅ Supports long-running Node.js processes
- ✅ Your scheduler will work perfectly
- ✅ SQLite database will persist
- ✅ Free tier: $5 credit/month (enough for small projects)
- ✅ Easy deployment from GitHub

**How to deploy on Railway:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable: `NEWSAPI_KEY=your_key_here`
6. Railway will automatically detect Node.js and deploy
7. Your scheduler will run automatically!

### Option 2: Render.com (ALSO GOOD)
**Why Render works:**
- ✅ Supports background workers
- ✅ Free tier available
- ✅ SQLite works (but use PostgreSQL for better persistence)
- ✅ Easy deployment

**How to deploy on Render:**
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variable: `NEWSAPI_KEY`
8. Deploy!

### Option 3: Fly.io (ADVANCED)
- ✅ Free tier with persistent storage
- ✅ Full Docker support
- ✅ Background processes work
- ⚠️ Requires more setup

---

## 📝 IF YOU STILL WANT TO USE VERCEL (NOT RECOMMENDED)

You would need to:
1. Use a different database (like PostgreSQL on Supabase)
2. Remove the automatic scheduler
3. Manually trigger news imports via API calls
4. Use external cron service (like cron-job.org) to call your API every 5 minutes

**This is complicated and defeats the purpose of your automatic system.**

---

## 🚀 QUICK START: Deploy to Railway (RECOMMENDED)

### Step 1: Prepare Your Project
1. Make sure your code is on GitHub
2. Create a `.gitignore` file (if not exists):
```
node_modules/
.env
backend/database/*.db
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Deploy on Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Hassan News repository
5. Railway will auto-detect Node.js
6. Add environment variables:
   - `NEWSAPI_KEY`: your NewsAPI key
   - `PORT`: 3000
7. Click "Deploy"

### Step 4: Your Site is Live!
- Railway will give you a URL like: `hassan-news.up.railway.app`
- Your scheduler will run automatically every 5 minutes
- Database will persist between restarts

---

## 💰 Cost Comparison

| Platform | Free Tier | Scheduler Works | Database Persists | Best For |
|----------|-----------|-----------------|-------------------|----------|
| **Railway** | $5/month credit | ✅ YES | ✅ YES | **YOUR PROJECT** |
| **Render** | 750 hours/month | ✅ YES | ✅ YES | Good alternative |
| **Fly.io** | 3 VMs free | ✅ YES | ✅ YES | Advanced users |
| **Vercel** | Unlimited | ❌ NO | ❌ NO | Static sites only |
| **Heroku** | No free tier | ✅ YES | ✅ YES | Paid only ($7/mo) |

---

## 🎓 FINAL RECOMMENDATION

**Use Railway.app** - It's the easiest and will work perfectly with your automatic news import system. Your $5/month credit is more than enough for a news website with moderate traffic.

If you need help with Railway deployment, let me know!
