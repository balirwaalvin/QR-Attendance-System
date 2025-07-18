# Heroku Deployment Guide

## Prerequisites

1. **Heroku CLI installed** - Download from https://devcenter.heroku.com/articles/heroku-cli
2. **Git repository** - Your project should be in a Git repository
3. **Gmail App Password** - For email functionality

## Step-by-Step Deployment

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku Application
```bash
heroku create your-app-name-here
```

### 3. Add MySQL Database
Choose one of these options:

**Option A: JawsDB (Recommended)**
```bash
heroku addons:create jawsdb:kitefin
```

**Option B: ClearDB**
```bash
heroku addons:create cleardb:ignite
```

### 4. Get Database Connection Details
```bash
# For JawsDB
heroku config:get JAWSDB_URL

# For ClearDB
heroku config:get CLEARDB_DATABASE_URL
```

The URL format will be: `mysql://username:password@hostname:port/database_name`

### 5. Set Environment Variables
```bash
# Set Node environment
heroku config:set NODE_ENV=production

# Set JWT Secret (generate a strong random string)
heroku config:set JWT_SECRET="your-super-secure-jwt-secret-here"

# Set database credentials (extract from the URL above)
heroku config:set DB_HOST="your-db-host"
heroku config:set DB_USER="your-db-username"
heroku config:set DB_PASSWORD="your-db-password"
heroku config:set DB_NAME="your-db-name"

# Set email configuration (use Gmail App Password)
heroku config:set SMTP_HOST="smtp.gmail.com"
heroku config:set SMTP_PORT="587"
heroku config:set SMTP_USER="your-email@gmail.com"
heroku config:set SMTP_PASS="your-gmail-app-password"
```

### 6. Deploy the Application
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 7. Set Up Database Schema
After deployment, set up your database:

**Method A: Using Heroku MySQL Client**
```bash
# Connect to your database
heroku config:get JAWSDB_URL
# Use the connection details to connect with MySQL client
```

**Method B: Import via phpMyAdmin or MySQL Workbench**
- Use the database credentials to connect
- Import `database/schema.sql`
- Import `database/seed.sql` (optional, for sample data)

### 8. Verify Deployment
```bash
heroku open
```

## Important Notes

### Gmail App Password Setup
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → App passwords
3. Generate an app password for "Mail"
4. Use this app password (not your regular password) for SMTP_PASS

### Environment Variables
- Never commit `.env` files to Git
- All sensitive data should be set as Heroku config vars
- Use `heroku config` to view current environment variables

### Database Management
- Your database URL contains all connection info
- For JawsDB: Usually includes host, username, password, and database name
- Keep database credentials secure and never expose them publicly

### Troubleshooting

**Build Failures:**
```bash
heroku logs --tail
```

**Database Connection Issues:**
```bash
heroku config
# Verify all DB_* variables are set correctly
```

**Application Errors:**
```bash
heroku logs --tail
# Check for runtime errors
```

## Production Checklist

- [ ] Heroku app created
- [ ] Database add-on installed
- [ ] All environment variables set
- [ ] Database schema imported
- [ ] Application deployed successfully
- [ ] Email functionality tested
- [ ] Admin account created
- [ ] QR code generation working
- [ ] File uploads working

## Post-Deployment

1. **Create Admin Account**: Visit `/admin-register` to create the first admin account
2. **Test Features**: Test event creation, QR generation, and attendance marking
3. **Configure Domain**: Set up custom domain if needed
4. **Monitor**: Set up monitoring and alerts for your application

## Scaling

To scale your application:
```bash
# Scale web dynos
heroku ps:scale web=2

# Scale database
heroku addons:upgrade jawsdb:leopard
```

## Maintenance

Regular maintenance tasks:
- Monitor database size and upgrade plan if needed
- Update dependencies regularly
- Check Heroku logs for any issues
- Backup database regularly
