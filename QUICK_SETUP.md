# 🚀 Quick GitHub & Heroku Deployment Setup

## Your project is ready! Here's what to do next:

### Step 1: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `qr-attendance-system`
3. Make it Public or Private (your choice)
4. **DON'T** check "Add a README file" (we already have one)
5. Click "Create repository"

### Step 2: Push Your Code to GitHub
Copy and paste these commands one by one:

```bash
# Connect to your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/qr-attendance-system.git

# Push your code to GitHub
git push -u origin main
```

### Step 3: Set up Heroku App
1. Go to https://dashboard.heroku.com/new-app
2. App name: `your-name-qr-attendance` (must be unique)
3. Choose region
4. Click "Create app"

### Step 4: Add Database
1. In your Heroku app, go to "Resources" tab
2. Search "JawsDB MySQL"
3. Add "JawsDB MySQL" with Kitefin (Free) plan

### Step 5: Connect GitHub to Heroku
1. In Heroku app, go to "Deploy" tab
2. Choose "GitHub" as deployment method
3. Connect your GitHub account
4. Search and select your repository
5. Enable "Automatic deploys" from main branch
6. Click "Deploy Branch"

### Step 6: Configure Environment Variables
In Heroku app "Settings" → "Config Vars", add:

```
NODE_ENV=production
JWT_SECRET=make-this-a-long-random-string-for-security
DB_HOST=[get from JAWSDB_URL]
DB_USER=[get from JAWSDB_URL]  
DB_PASSWORD=[get from JAWSDB_URL]
DB_NAME=[get from JAWSDB_URL]
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

**To get DB credentials:**
- Find `JAWSDB_URL` in your config vars
- Format: `mysql://username:password@hostname:port/database_name`
- Extract each part for the DB_* variables

### Step 7: Set up Database
Use any MySQL client to connect to your JawsDB database and run:
1. `database/schema.sql` (creates tables)
2. `database/seed.sql` (optional sample data)

### Step 8: Get Gmail App Password
1. Enable 2-Factor Authentication on your Gmail
2. Go to Google Account → Security → App passwords
3. Generate password for "Mail"
4. Use this for `SMTP_PASS`

### Step 9: Test Your App
Click "Open app" in Heroku dashboard and test:
- Homepage loads
- Admin registration at `/admin-register`
- Event creation works
- QR codes generate

## 🎉 That's it! Your app should be live!

### Making Updates
After making changes:
```bash
git add .
git commit -m "Your update description"
git push origin main
```
Heroku will automatically deploy your changes!

### Need Help?
- Check detailed guide: `GITHUB_DEPLOYMENT.md`
- View Heroku logs: `heroku logs --tail --app your-app-name`
- For issues: Check the troubleshooting section in documentation

Your QR Attendance System is production-ready! 🚀
