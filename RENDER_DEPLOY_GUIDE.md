# Deploy Backend to Render - Quick Guide

## Prerequisites
- Render account (free) - https://render.com
- GitHub account with your code pushed
- MySQL database details

## Step 1: Connect GitHub to Render

1. Go to https://render.com
2. Click "Sign up" → "Continue with GitHub"
3. Authorize Render to access your GitHub
4. Select repository

## Step 2: Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Choose your repository with the backend code

## Step 3: Configure Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `jobquest-backend` |
| **Environment** | Node |
| **Region** | Choose closest to you (Singapore/Mumbai if in Asia) |
| **Branch** | master (or main) |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

## Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add each of these:

```
DB_HOST=your-database-host.com
DB_PORT=3306
DB_NAME=jobquest
DB_USER=root
DB_PASSWORD=pass123
JWT_SECRET=generate-a-random-secret-key
NODE_ENV=production
CLIENT_URL=https://jobquestlk.me
PORT=10000
```

⚠️ **Important:** 
- `DB_HOST` must be publicly accessible (cloud-hosted MySQL)
- If your MySQL is local/private, it won't work
- You need: AWS RDS, PlanetScale, Azure Database, etc.

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render starts building (takes 2-3 minutes)
3. Watch the build logs scroll by
4. Once deployed, you'll see: ✅ **"Deployed"**

## Step 6: Get Your Backend URL

Render assigns a URL like:
```
https://jobquest-backend.onrender.com
```

Copy this URL!

## Step 7: Update Frontend

On Hostinger, update `.env.production`:

```env
VITE_API_URL=https://jobquest-backend.onrender.com
```

Then:
1. Run: `npm run build`
2. Upload new `dist/` to Hostinger `public_html/`

## Step 8: Test API

1. Visit: `https://jobquest-backend.onrender.com/api/health`
2. Should see: `{"status":"OK","timestamp":"...","database":"Connected"}`

## ⚠️ Free Plan Limitations

| Limitation | Impact | Solution |
|-----------|--------|----------|
| Cold start (30-50s) | Slow first request | Upgrade to Starter ($7/mo) |
| Spins down after 15 min | App inactive | Ping API every 10 min |
| 512MB RAM | Limited memory | Should be fine for API |
| Shared CPU | Slower performance | Upgrade if needed |

## 🔧 Troubleshooting

### Build fails
- Check `npm install` runs locally
- Check `server/package.json` has all dependencies

### Can't connect to database
- Verify MySQL is cloud-hosted (not local)
- Check credentials are correct
- Test connection locally first

### API returns 500 errors
- Check environment variables in Render
- Look at Render logs in dashboard
- Ensure database is accessible

### "Application crashed" error
- Check server logs in Render
- May be database connection issue
- Verify all env vars are set

## 📊 Monitoring

In Render dashboard:
- **Logs** - See real-time server logs
- **Metrics** - CPU, memory, requests
- **Events** - Deployment history

## Next Steps

After deployment:
1. Test all API endpoints
2. Monitor logs for errors
3. Set up error notifications
4. Consider upgrade if cold starts are annoying

---

**Need help?**
- Render docs: https://render.com/docs
- Check Render logs for error details
