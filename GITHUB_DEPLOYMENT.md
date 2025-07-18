# GitHub to Heroku Deployment Guide

## Overview
This guide will help you deploy your QR Attendance System from GitHub to Heroku with automatic deployments.

## Prerequisites

1. **GitHub Account** - Create account at https://github.com
2. **Heroku Account** - Create account at https://heroku.com
3. **Git installed** - Download from https://git-scm.com
4. **Gmail App Password** - For email functionality

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository
1. Go to https://github.com and click "New repository"
2. Name it `qr-attendance-system`
3. Make it public or private as needed
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

### 1.2 Connect Local Repository to GitHub
```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/qr-attendance-system.git

# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit: QR Attendance System ready for deployment"

# Push to GitHub
git push -u origin main
```

## Step 2: Set up Heroku

### 2.1 Create Heroku App
1. Go to https://dashboard.heroku.com
2. Click "New" → "Create new app"
3. Choose a unique app name (e.g., `your-name-qr-attendance`)
4. Select region (US or Europe)
5. Click "Create app"

### 2.2 Add MySQL Database
In your Heroku app dashboard:
1. Go to "Resources" tab
2. Search for "JawsDB MySQL"
3. Select "JawsDB MySQL" → "Kitefin (Free)" plan
4. Click "Submit Order Form"

### 2.3 Get Database Connection Details
1. Go to "Settings" tab
2. Click "Reveal Config Vars"
3. Find `JAWSDB_URL` - it contains your database connection info
4. Format: `mysql://username:password@hostname:port/database_name`

## Step 3: Configure Environment Variables

In Heroku app "Settings" → "Config Vars", add these:

```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here-make-it-long-and-random
DB_HOST=your-jawsdb-hostname
DB_USER=your-jawsdb-username  
DB_PASSWORD=your-jawsdb-password
DB_NAME=your-jawsdb-database-name
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Important Notes:
- **JWT_SECRET**: Generate a random 64+ character string
- **DB credentials**: Extract from the JAWSDB_URL
- **SMTP_PASS**: Use Gmail App Password, not your regular password

## Step 4: Connect GitHub to Heroku

### Option A: Automatic Deployment (Recommended)
1. In Heroku app dashboard, go to "Deploy" tab
2. Select "GitHub" as deployment method
3. Connect your GitHub account
4. Search and select your repository
5. Enable "Automatic deploys" from main branch
6. Click "Deploy Branch" for initial deployment

### Option B: GitHub Actions (Advanced)
If you want to use the included GitHub Actions workflow:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `HEROKU_API_KEY`: Your Heroku API key (find in Heroku Account Settings)
   - `HEROKU_APP_NAME`: Your Heroku app name
   - `HEROKU_EMAIL`: Your Heroku account email

## Step 5: Set up Database Schema

After successful deployment:

### 5.1 Access Database
1. Install MySQL client or use online tool
2. Connect using JAWSDB credentials from Config Vars
3. Or use Heroku CLI: `heroku config:get JAWSDB_URL --app your-app-name`

### 5.2 Import Database Schema
Run these SQL files in order:
1. `database/schema.sql` - Creates tables
2. `database/seed.sql` - Adds sample data (optional)

### 5.3 Alternative: Use Database Management Tool
- **phpMyAdmin**: Many hosting providers offer this
- **MySQL Workbench**: Desktop application
- **HeidiSQL**: Free desktop tool
- **Online tools**: Various web-based MySQL clients

## Step 6: Verify Deployment

1. **Check deployment status** in Heroku dashboard
2. **Open your app**: Click "Open app" button
3. **Test features**:
   - Visit homepage
   - Try admin registration at `/admin-register`
   - Test event creation
   - Verify QR code generation

## Step 7: Gmail App Password Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use this password for `SMTP_PASS` config var

## Troubleshooting

### Deployment Fails
```bash
# Check Heroku logs
heroku logs --tail --app your-app-name
```

### Database Connection Issues
- Verify all DB_* config vars are set correctly
- Check JAWSDB_URL format and extract credentials properly
- Ensure database schema is imported

### Application Errors
- Check Heroku logs for detailed error messages
- Verify all environment variables are set
- Test endpoints individually

## Common Issues & Solutions

### 1. Build Fails
- Check package.json scripts
- Ensure all dependencies are listed
- Verify Node.js version compatibility

### 2. Database Connection Errors
- Double-check database credentials
- Ensure JawsDB addon is properly configured
- Verify schema is imported correctly

### 3. Email Not Working
- Confirm Gmail App Password (not regular password)
- Check SMTP settings
- Verify Gmail 2FA is enabled

## Post-Deployment Checklist

- [ ] App deploys successfully
- [ ] Database tables created
- [ ] Admin registration works
- [ ] User registration works
- [ ] Event creation works
- [ ] QR codes generate properly
- [ ] Email notifications send
- [ ] File uploads work
- [ ] Reports generate correctly

## Maintenance & Updates

### Making Changes
1. Make changes locally
2. Test thoroughly
3. Commit to GitHub: `git add . && git commit -m "Update description"`
4. Push to GitHub: `git push origin main`
5. Heroku will automatically deploy (if auto-deploy is enabled)

### Database Backups
Regularly backup your database:
```bash
heroku pg:backups:capture --app your-app-name
```

### Scaling
If you need more resources:
```bash
# Scale web dynos
heroku ps:scale web=2 --app your-app-name

# Upgrade database
heroku addons:upgrade jawsdb:leopard --app your-app-name
```

Your QR Attendance System is now ready for professional deployment! 🚀
