# Hostinger Frontend Deployment Checklist

## Pre-Deployment
- [ ] Update `.env.production` with your actual backend API URL
- [ ] Run `npm run build` locally to test
- [ ] Check `dist/` folder is created with files

## Upload to Hostinger
- [ ] Upload all files from `dist/` to `public_html/` via FTP or cPanel
- [ ] Upload `.htaccess` file to `public_html/`
- [ ] Verify file permissions: 644 for files, 755 for directories

## Configuration
- [ ] Ensure mod_rewrite is enabled (should be by default)
- [ ] SSL certificate installed (AutoSSL should be active)
- [ ] Domain DNS points to Hostinger nameservers

## Testing
- [ ] Visit `https://jobquestlk.me` in browser
- [ ] Check all pages load correctly
- [ ] Test navigation/routing (should not get 404 for SPA routes)
- [ ] Open DevTools Console - should have no 404 errors for assets
- [ ] Test API calls - verify they reach your backend
- [ ] Clear browser cache if seeing old content

## Troubleshooting
If assets return 404:
- [ ] Verify `.htaccess` is in `public_html/` (not in subdirectory)
- [ ] Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- [ ] Check file permissions in cPanel
- [ ] Verify `index.html` exists in `public_html/`

If API calls fail:
- [ ] Check `VITE_API_URL` is correct in `.env.production`
- [ ] Rebuild: `npm run build`
- [ ] Re-upload `dist/` contents
- [ ] Ensure backend server is running and accessible

## File Structure on Hostinger
```
public_html/
├── index.html
├── assets/
│   ├── index-CAw7u1gS.css
│   ├── index-q4m14zrn.js
│   └── [other assets]
├── vite.svg
└── .htaccess  ← IMPORTANT!
```

## Performance Tips
- [ ] Enable gzip compression (.htaccess already has this)
- [ ] Browser caching configured (.htaccess already has this)
- [ ] CSS/JS are minified (Vite does this automatically)
- [ ] Images are optimized

---
**Ready to deploy?** Follow this sequence:
1. Update `.env.production` with backend URL
2. Run `npm run build`
3. Upload `dist/` to `public_html/`
4. Upload `.htaccess` to `public_html/`
5. Test in browser
