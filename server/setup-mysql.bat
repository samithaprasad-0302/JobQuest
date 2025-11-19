@echo off
REM MySQL Installation and Setup Script for Windows

echo.
echo ========================================
echo MySQL Setup for JobQuest
echo ========================================
echo.

echo Step 1: Checking if MySQL is already installed...
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL is already installed!
    mysql --version
    goto :setup_database
) else (
    echo ❌ MySQL is not installed.
    echo.
    echo Please download and install MySQL Community Server from:
    echo https://dev.mysql.com/downloads/mysql/
    echo.
    echo After installation, make sure to:
    echo 1. Add MySQL to PATH environment variable
    echo 2. Note your username and password
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

:setup_database
echo.
echo Step 2: Creating JobQuest database...
echo.
echo Please enter your MySQL root password when prompted:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS jobquest;"

if %errorlevel% equ 0 (
    echo ✅ Database created successfully!
    echo.
    echo Step 3: Creating .env file...
    
    REM Check if .env exists
    if not exist "..\server\.env" (
        echo Creating .env file...
        (
            echo PORT=5000
            echo DB_HOST=localhost
            echo DB_PORT=3306
            echo DB_NAME=jobquest
            echo DB_USER=root
            echo DB_PASSWORD=your_password_here
            echo JWT_SECRET=your_jwt_secret_here
            echo NODE_ENV=development
            echo CLIENT_URL=http://localhost:5173
        ) > "..\server\.env"
        
        echo ✅ .env file created at server/.env
        echo.
        echo ⚠️  IMPORTANT: Update the following in server/.env:
        echo    - DB_USER: your MySQL username
        echo    - DB_PASSWORD: your MySQL password
        echo    - JWT_SECRET: a secure secret key
    ) else (
        echo ℹ️  .env file already exists. Skipping creation.
    )
    
    echo.
    echo ✅ MySQL setup complete!
    echo.
    echo Next steps:
    echo 1. Update server/.env with your MySQL credentials
    echo 2. Run: npm run migrate
    echo.
    pause
) else (
    echo ❌ Failed to create database. Check your MySQL password and try again.
    pause
    exit /b 1
)
