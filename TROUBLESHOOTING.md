# Heroku Deployment Troubleshooting Guide

## ✅ Build Issues Fixed

The following issues have been resolved in the latest commit:

1. **✅ Fixed:** `react-app-rewired: not found` error
   - **Solution:** Moved `react-app-rewired` and `customize-cra` from devDependencies to dependencies
   - **Reason:** Heroku doesn't install devDependencies by default

2. **✅ Fixed:** Node.js version specification
   - **Solution:** Changed from `>=16.0.0` to `18.x` format
   - **Reason:** Heroku prefers specific version ranges

3. **✅ Fixed:** Build process optimization
   - **Solution:** Use `npm ci` instead of `npm install` for faster, more reliable builds

## Common Heroku Deployment Issues & Solutions

### 1. Build Fails with "Module not found"
**Problem:** Missing dependencies or incorrect package.json
**Solutions:**
- Ensure all build-time dependencies are in `dependencies`, not `devDependencies`
- Check that all imported modules are properly installed
- Verify package.json syntax is correct

### 2. Application Error (H10)
**Problem:** App crashes on startup
**Solutions:**
- Check Heroku logs: `heroku logs --tail --app your-app-name`
- Verify environment variables are set correctly
- Ensure database connection is working
- Check that your app listens on the correct port: `process.env.PORT`

### 3. Database Connection Issues
**Problem:** Can't connect to database
**Solutions:**
- Verify all DB_* environment variables are set
- Check JawsDB addon is properly configured
- Ensure database schema is imported
- Test connection with database credentials

### 4. Memory Quota Exceeded
**Problem:** App exceeds memory limits
**Solutions:**
- Optimize build process
- Remove unnecessary dependencies
- Consider upgrading to paid Heroku plan
- Use `npm ci` instead of `npm install`

### 5. Slow Build Times
**Problem:** Build takes too long and times out
**Solutions:**
- Use `npm ci` for faster installs
- Remove unused dependencies
- Optimize webpack configuration
- Consider using buildpacks

## Viewing Heroku Logs

To diagnose issues, always check your Heroku logs:

```bash
# View recent logs
heroku logs --app your-app-name

# Stream live logs
heroku logs --tail --app your-app-name

# View build logs
heroku logs --source app --app your-app-name
```

## Environment Variables Checklist

Ensure these are set in Heroku Config Vars:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET=your-secret-here`
- [ ] `DB_HOST=your-db-host`
- [ ] `DB_USER=your-db-user`
- [ ] `DB_PASSWORD=your-db-password`
- [ ] `DB_NAME=your-db-name`
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_USER=your-email@gmail.com`
- [ ] `SMTP_PASS=your-app-password`

## Database Setup Checklist

- [ ] JawsDB MySQL addon added
- [ ] Database connection credentials extracted from `JAWSDB_URL`
- [ ] `database/schema.sql` imported
- [ ] `database/seed.sql` imported (optional)
- [ ] Database connection tested

## Post-Deployment Testing

After successful deployment:

1. **Homepage Test:** Visit your app URL
2. **Admin Registration:** Go to `/admin-register`
3. **Create Event:** Test event creation
4. **QR Generation:** Verify QR codes are generated
5. **Email Test:** Test email notifications
6. **Mobile Test:** Check mobile responsiveness

## Getting Help

If you're still having issues:

1. **Check Heroku Status:** https://status.heroku.com/
2. **Review Build Logs:** Look for specific error messages
3. **Test Locally:** Ensure app works on your machine
4. **Check Documentation:** Review Heroku Node.js documentation
5. **Community Help:** Stack Overflow with heroku tag

## Latest Fixes Applied

✅ **react-app-rewired dependency** - Moved to dependencies
✅ **Node.js version format** - Changed to Heroku-compatible format
✅ **Build optimization** - Using npm ci for faster builds
✅ **Package structure** - Proper dependency organization

Your app should now deploy successfully! 🚀

If you encounter any new issues, check the Heroku logs and refer to this troubleshooting guide.
