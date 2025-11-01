# JobQuest Deployment Guide

## DigitalOcean Deployment Instructions

### Prerequisites
- DigitalOcean account
- GitHub repository with the code pushed
- MongoDB Atlas account (or any MongoDB service)

### Step 1: Setup Environment Variables

In DigitalOcean App Platform, add the following environment variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobquest
JWT_SECRET=your_secure_jwt_secret_key_here
CORS_ORIGIN=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
```

### Step 2: Configure App Platform

1. Go to DigitalOcean App Platform
2. Click "Create" → "App"
3. Select your GitHub repository
4. Connect the `master` branch
5. Set the following configuration:

**Build Command:**
```
npm install && npm run build && npm install --prefix server
```

**Run Command:**
```
npm start
```

### Step 3: Set Build Configuration

In the App Spec:
- **Name**: jobquest
- **Source Type**: GitHub
- **HTTP Routes**: 
  - Port: 5000
  - Routes: /

### Step 4: Configure Domains

1. Add your custom domain
2. Enable HTTPS (free SSL certificate)

### Step 5: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Check the deployment logs if there are any errors

### Troubleshooting

**Error: Missing start command**
- ✅ Fixed: Added `Procfile` with `web: npm --prefix server start`

**Error: Health check failure**
- Ensure MongoDB URI is correctly set in environment variables
- Check JWT_SECRET is set
- Verify CORS_ORIGIN matches your domain

**Error: Port already in use**
- DigitalOcean automatically assigns PORT from environment
- Ensure server listens on `process.env.PORT`

## Local Development

```bash
# Install dependencies
npm install
npm install --prefix server

# Start backend (from project root)
npm --prefix server start

# In another terminal, start frontend
npm run dev
```

## Frontend Build Output

The frontend builds to `dist/` folder. In production:
- Backend serves API on `/api`
- Static files are served from `dist/`

## Security Checklist

- [ ] MongoDB URI uses strong password
- [ ] JWT_SECRET is a strong random string (32+ characters)
- [ ] CORS_ORIGIN is set to your domain only
- [ ] NODE_ENV is set to `production`
- [ ] No sensitive data in code (check `.env.example`)
- [ ] HTTPS is enabled on custom domain
