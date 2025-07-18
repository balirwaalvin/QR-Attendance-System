# QR Attendance System - GitHub Setup Script
# PowerShell version for Windows

Write-Host "🚀 Setting up QR Attendance System for GitHub & Heroku deployment..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: QR Attendance System ready for deployment

- Organized project structure for Heroku deployment
- Added security middleware (helmet, compression)  
- Configured production environment settings
- Added comprehensive documentation
- Ready for GitHub to Heroku automatic deployment"

Write-Host "✅ Git repository prepared!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository at https://github.com/new" -ForegroundColor White
Write-Host "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/qr-attendance-system.git" -ForegroundColor White
Write-Host "3. Push code: git push -u origin main" -ForegroundColor White
Write-Host "4. Follow GITHUB_DEPLOYMENT.md for Heroku setup" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Don't forget to:" -ForegroundColor Cyan
Write-Host "- Update backend/.env with your local database credentials" -ForegroundColor White
Write-Host "- Set up Heroku config vars with production values" -ForegroundColor White
Write-Host "- Import database schema to your Heroku database" -ForegroundColor White
Write-Host "- Get Gmail App Password for email functionality" -ForegroundColor White
