# MySQL Setup Script for JobQuest (Windows PowerShell)
# Usage: .\setup-mysql.ps1

Write-Host @"
========================================
MySQL Setup for JobQuest
========================================
"@ -ForegroundColor Cyan

# Step 1: Check if MySQL is installed
Write-Host "`nStep 1: Checking if MySQL is installed..." -ForegroundColor Yellow

try {
    $version = mysql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MySQL is already installed!" -ForegroundColor Green
        Write-Host $version
    } else {
        throw "MySQL not found"
    }
} catch {
    Write-Host "❌ MySQL is not installed." -ForegroundColor Red
    Write-Host @"

Please download and install MySQL Community Server from:
https://dev.mysql.com/downloads/mysql/

Installation Steps:
1. Download MySQL Community Server
2. Run the installer
3. During setup, set:
   - Port: 3306 (default)
   - MySQL Server User: root
   - Password: Choose a secure password
4. Complete the installation
5. Add MySQL to PATH:
   - Right-click 'This PC' -> Properties
   - Click 'Advanced system settings'
   - Click 'Environment Variables'
   - Add MySQL bin folder (usually C:\Program Files\MySQL\MySQL Server 8.0\bin)
6. Open a new PowerShell and run this script again

"@ -ForegroundColor Yellow
    
    Read-Host "Press Enter to open MySQL download page in browser"
    Start-Process "https://dev.mysql.com/downloads/mysql/"
    exit
}

# Step 2: Create JobQuest database
Write-Host "`nStep 2: Creating JobQuest database..." -ForegroundColor Yellow

$continue = Read-Host "Do you want to create the database now? (y/n)"
if ($continue -ne 'y') {
    Write-Host "Skipping database creation" -ForegroundColor Yellow
    goto :update_env
}

Write-Host "Please enter your MySQL root password:" -ForegroundColor Cyan
$password = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($password))

try {
    # Create database
    $query = "CREATE DATABASE IF NOT EXISTS jobquest;"
    $result = mysql -u root -p"$plainPassword" -e $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database. Check your password." -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Create/Update .env file
:update_env
Write-Host "`nStep 3: Configuring .env file..." -ForegroundColor Yellow

$envPath = Join-Path (Split-Path -Parent $PSScriptRoot) "server\.env"

if (Test-Path $envPath) {
    Write-Host "✅ .env file already exists at $envPath" -ForegroundColor Green
    $update = Read-Host "Do you want to update it? (y/n)"
    if ($update -ne 'y') {
        goto :final_steps
    }
}

Write-Host "`nEnter MySQL configuration:" -ForegroundColor Cyan
$dbHost = Read-Host "Database Host (default: localhost)" -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Database Port (default: 3306)" -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "3306" }

$dbUser = Read-Host "Database User (default: root)" -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "root" }

$dbPassword = Read-Host "Database Password" -AsSecureString
$plainDbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPassword))

$jwtSecret = Read-Host "JWT Secret (leave blank to generate)" -ErrorAction SilentlyContinue
if ([string]::IsNullOrWhiteSpace($jwtSecret)) {
    $jwtSecret = ([guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()).Replace("-", "")
}

# Create .env content
$envContent = @"
# MySQL Configuration
DB_HOST=$dbHost
DB_PORT=$dbPort
DB_NAME=jobquest
DB_USER=$dbUser
DB_PASSWORD=$plainDbPassword

# JWT Configuration
JWT_SECRET=$jwtSecret

# Application Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000/api

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
"@

# Write .env file
try {
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8 -Force
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host "Location: $envPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create .env file: $_" -ForegroundColor Red
    exit 1
}

# Final steps
:final_steps
Write-Host @"

========================================
✅ MySQL Setup Complete!
========================================

Next Steps:
1. Verify MySQL is running
2. Run the migration script:
   cd server
   npm run migrate

3. Start your application:
   npm run dev

Connection Details:
- Host: $dbHost
- Port: $dbPort
- Database: jobquest
- User: $dbUser

Documentation: See server/MYSQL_SETUP.md for more details

"@ -ForegroundColor Green

Read-Host "Press Enter to exit"
