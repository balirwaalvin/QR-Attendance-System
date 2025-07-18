#!/bin/bash

echo "🚀 Setting up QR Attendance System for GitHub & Heroku deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
fi

# Add all files
echo "Adding files to Git..."
git add .

# Commit
echo "Creating initial commit..."
git commit -m "Initial commit: QR Attendance System ready for deployment

- Organized project structure for Heroku deployment
- Added security middleware (helmet, compression)
- Configured production environment settings
- Added comprehensive documentation
- Ready for GitHub to Heroku automatic deployment"

echo "✅ Git repository prepared!"
echo ""
echo "📋 Next steps:"
echo "1. Create GitHub repository at https://github.com/new"
echo "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/qr-attendance-system.git"
echo "3. Push code: git push -u origin main"
echo "4. Follow GITHUB_DEPLOYMENT.md for Heroku setup"
echo ""
echo "🔧 Don't forget to:"
echo "- Update backend/.env with your local database credentials"
echo "- Set up Heroku config vars with production values"
echo "- Import database schema to your Heroku database"
echo "- Get Gmail App Password for email functionality"
