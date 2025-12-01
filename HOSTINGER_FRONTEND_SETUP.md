# JobQuest Frontend Hosting on Hostinger Business Plan

## Overview
This guide explains how to host only the React frontend on Hostinger Business Plan.

## Prerequisites
- Hostinger Business Plan (or higher)
- cPanel access
- Domain connected to Hostinger

## Step-by-Step Setup

### 1. Build the Frontend
```bash
npm run build
```
This creates the `dist/` folder with all static files.

### 2. Upload Files to Hostinger

#### Via cPanel File Manager:
1. Log in to **cPanel** from Hostinger dashboard
2. Open **File Manager**
3. Navigate to **public_html** folder
4. Upload all files from your local `dist/` folder to `public_html`

**Folder structure after upload:**
```
public_html/
├── index.html
├── assets/
│   ├── index-CAw7u1gS.css
│   ├── index-q4m14zrn.js
│   └── logo-CQ9i85lO.png
└── vite.svg
```

#### Via FTP (Recommended for larger projects):
1. Get FTP credentials from Hostinger dashboard
2. Use FileZilla or similar FTP client
3. Connect to your Hostinger FTP server
4. Upload `dist/` contents to `public_html`

### 3. Create .htaccess for SPA Routing

Create `.htaccess` file in `public_html/` with this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite actual files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite all non-API requests to index.html (SPA routing)
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>

# Enable gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Set correct MIME types
<FilesMatch "\.js$">
  AddType application/javascript .js
</FilesMatch>

<FilesMatch "\.css$">
  AddType text/css .css
</FilesMatch>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 day"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
</IfModule>
```

### 4. Update Frontend Configuration

Your frontend needs to use the correct API URL. Edit `src/services/api.ts`:

```typescript
const API_URL = process.env.VITE_API_URL || 'https://your-backend-api.com';
// NOT your frontend domain - point to your backend server
```

Create `.env.production` in root folder:
```env
VITE_API_URL=https://your-backend-api.com
```

Then rebuild:
```bash
npm run build
```

### 5. Verify Setup

1. Visit your domain: `https://jobquestlk.me`
2. Check browser console for errors
3. Verify API calls are going to correct backend

### 6. Troubleshooting

**Assets not loading (404 errors):**
- Ensure `.htaccess` is in `public_html/`
- Check file permissions (644 for files, 755 for folders)
- Clear browser cache (Ctrl+Shift+R)

**White screen or routing errors:**
- Verify `.htaccess` is correctly uploaded
- Check mod_rewrite is enabled in Hostinger (usually enabled by default)
- Check console errors in DevTools

**API calls failing:**
- Verify backend server is running
- Check VITE_API_URL environment variable
- Ensure CORS is enabled on backend

### 7. Important Notes

- **Frontend only**: This setup hosts ONLY the React app
- **Backend separately**: Your Node.js backend must run on a separate server
- **No server-side rendering**: This is static hosting suitable for Hostinger

### 8. File Size Optimization

If your build is too large:

```bash
# Check what's taking space
npm run build -- --analyze

# Reduce chunk sizes in vite.config.ts
```

### 9. SSL Certificate

Hostinger Business Plan includes free SSL. Activate in cPanel:
- Go to **AutoSSL** in cPanel
- Or access SSL via Hostinger dashboard

Your site should be accessible as: `https://jobquestlk.me`

---

## Summary

| Step | Tool | Location |
|------|------|----------|
| Build | `npm run build` | Local machine |
| Upload | FileZilla/cPanel | `public_html/` |
| Route | `.htaccess` | `public_html/` |
| Domain | DNS Settings | Hostinger dashboard |
| SSL | AutoSSL | Hostinger cPanel |

That's it! Your frontend is now hosted on Hostinger Business Plan.
