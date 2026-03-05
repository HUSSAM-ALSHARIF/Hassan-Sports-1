# 🚂 Railway Deployment Guide for Hassan News

## ⚠️ IMPORTANT: Don't Upload node_modules!

**NEVER upload `node_modules` to GitHub!** Railway will install them automatically.

---

## 📋 Step-by-Step Deployment

### Step 1: Clean Up Your Git Repository

If you already added `node_modules` by mistake, remove them:

```bash
# Remove node_modules from git tracking
git rm -r --cached node_modules

# Commit the change
git add .
git commit -m "Remove node_modules from git"
```

### Step 2: Verify .gitignore

Make sure your `.gitignore` file contains:
```
node_modules/
.env
*.db
*.log
.DS_Store
```

### Step 3: Push to GitHub

```bash
# Add all files (node_modules will be ignored automatically)
git add .

# Commit your changes
git commit -m "Ready for Railway deployment"

# Push to GitHub
git push origin main
```

**Note:** If you don't have a GitHub repository yet:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Hassan News"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/hassan-news.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploy to Railway

### Step 1: Sign Up for Railway
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `hassan-news` repository
4. Railway will automatically detect it's a Node.js project

### Step 3: Add Environment Variables
1. Click on your project
2. Go to "Variables" tab
3. Add these variables:
   - `NEWSAPI_KEY` = `your_newsapi_key_here`
   - `PORT` = `3000`
   - `NODE_ENV` = `production`

### Step 4: Deploy!
1. Railway will automatically:
   - Install `node_modules` (from package.json)
   - Run `npm install`
   - Start your server with `npm start`
2. Wait 2-3 minutes for deployment
3. Click "Generate Domain" to get your public URL

---

## 🎯 What Railway Does Automatically

✅ Installs all dependencies from `package.json`
✅ Creates `node_modules` folder on their server
✅ Runs your database migrations
✅ Starts your server
✅ Keeps it running 24/7
✅ Auto-restarts if it crashes

---

## 📦 What to Upload to GitHub

### ✅ DO Upload:
- `package.json` (lists all dependencies)
- `package-lock.json` (locks dependency versions)
- All your code files (`.js`, `.html`, `.css`)
- `.gitignore` file
- `README.md`

### ❌ DON'T Upload:
- `node_modules/` (too large, Railway installs it)
- `.env` (contains secrets)
- `*.db` files (database files)
- `.DS_Store` (Mac system files)

---

## 🔧 Troubleshooting

### Problem: "Too many files to upload"
**Solution:** You're trying to upload `node_modules`. Follow Step 1 above to remove it.

### Problem: "Git push rejected"
**Solution:** Your repository might be too large. Remove `node_modules`:
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules"
git push origin main --force
```

### Problem: Railway deployment fails
**Solution:** Check the logs in Railway dashboard. Common issues:
- Missing `NEWSAPI_KEY` environment variable
- Wrong `package.json` start script

---

## 📊 File Size Comparison

- **With node_modules:** ~200 MB (thousands of files) ❌
- **Without node_modules:** ~2 MB (your code only) ✅

---

## 🎓 Quick Commands Reference

```bash
# Check what will be uploaded
git status

# See what's ignored
git status --ignored

# Remove node_modules from git
git rm -r --cached node_modules

# Add everything (respects .gitignore)
git add .

# Commit
git commit -m "Your message"

# Push to GitHub
git push origin main
```

---

## ✅ Final Checklist

Before pushing to GitHub:
- [ ] `.gitignore` includes `node_modules/`
- [ ] `node_modules` is not in git (check with `git status`)
- [ ] `.env` is not in git
- [ ] `package.json` has all dependencies listed
- [ ] Code is committed and ready to push

---

## 🆘 Need Help?

If you're still having issues, run these commands and show me the output:

```bash
# Check git status
git status

# Check what's being tracked
git ls-files | grep node_modules

# Check .gitignore
cat .gitignore
```

---

## 🎉 After Deployment

Once deployed on Railway:
- Your site will be live at: `https://your-project.up.railway.app`
- News will update every 2 hours automatically
- Database persists between restarts
- No need to keep your computer running!

**Share your Railway URL and start selling! 🚀**
