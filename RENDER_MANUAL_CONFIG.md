# Render Manual Configuration (Instead of render.yaml)

## Why Manual?
The `render.yaml` file can sometimes cause path issues. Manual configuration in Render dashboard is more reliable.

## Follow These Steps Exactly:

### 1. In Render Dashboard → Create Web Service

**Basic Information:**
- Connect your GitHub repository
- Name: `jobquest-backend`
- Environment: `Node`
- Region: Singapore (or your region)
- Branch: `master` (or `main`)
- **Root Directory:** `server` ← IMPORTANT!

### 2. Build & Start Commands

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

### 3. Environment Variables (in Render Dashboard)

Click "Advanced" → "Add Environment Variable" for each:

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `DB_HOST` | your-database-host.com |
| `DB_PORT` | `3306` |
| `DB_NAME` | `jobquest` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `pass123` |
| `JWT_SECRET` | generate-random-key |
| `CLIENT_URL` | `https://jobquestlk.me` |

### 4. Health Check Path
```
/api/health
```

### 5. Auto-Deploy
Toggle "Auto-deploy" to ON

### 6. Deploy
Click "Create Web Service" and wait for deployment.

---

## Key Point: ROOT DIRECTORY

Make sure you set **Root Directory** to `server` in Render dashboard. This tells Render to:
- Look for `package.json` in `server/package.json`
- Look for models in `server/models/`
- Not look in `src/server/` or other paths

---

## After Deployment

1. Check logs for:
   - ✅ `npm install` completed
   - ✅ `✅ Connected to MySQL`
   - ✅ `🚀 Server running on port 10000`

2. Test health endpoint:
   - Visit: `https://your-service-name.onrender.com/api/health`
   - Should see: `{"status":"OK","timestamp":"...","database":"Connected"}`

---

## If Still Getting Error

1. In Render Dashboard → Settings → Clear build cache
2. Click "Redeploy"
3. Check logs again

This should resolve the path issue!
