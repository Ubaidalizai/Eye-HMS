# 🚀 Vercel Deployment Setup - Step by Step

## Quick Fix Applied ✅

I've fixed the Vercel configuration issues. Here's what was changed:

1. ✅ Fixed serverless function handler (`Backend/api/index.js`)
2. ✅ Updated database connection for serverless (`Backend/config/db.js`)
3. ✅ Updated Vercel configuration (`Backend/vercel.json`)

---

## 📋 Deployment Instructions

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Backend Deployment:

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repo `Ubaidalizai/Eye-HMS`
4. **Settings**:
   - **Root Directory**: `Backend` ⚠️ IMPORTANT
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

5. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_min_32_chars
   JWT_EXPIRES_IN=1d
   COOKIE_MAX_AGE=86400000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. **Deploy** → Copy the deployment URL

#### Frontend Deployment:

1. **Add New Project** in Vercel
2. **Import**: Same repo `Ubaidalizai/Eye-HMS`
3. **Settings**:
   - **Root Directory**: `Frontend` ⚠️ IMPORTANT
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api/v1
   VITE_IMAGE_BASE_URL=https://your-backend-url.vercel.app/public/img
   ```

5. **Deploy** → Copy the frontend URL

6. **Update Backend**: Go back to backend project → Settings → Environment Variables → Update `FRONTEND_URL` → Redeploy

---

### Option 2: Deploy via CLI

#### Backend:
```bash
cd Backend
vercel
# Follow prompts
# Set Root Directory: Backend
# Add environment variables when prompted
```

#### Frontend:
```bash
cd Frontend
vercel
# Follow prompts
# Set Root Directory: Frontend
# Add environment variables when prompted
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot find module"
**Solution**: Make sure Root Directory is set to `Backend` or `Frontend` correctly

### Issue 2: "Database connection failed"
**Solution**: 
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Verify `MONGO_URI` format
- Check connection string includes database name

### Issue 3: "CORS error"
**Solution**: 
- Update `FRONTEND_URL` in backend env vars
- Redeploy backend after updating

### Issue 4: "Function timeout"
**Solution**: 
- Vercel free tier has 10s timeout
- Consider Railway/Render for backend (better for file uploads)

### Issue 5: "File upload not working"
**Solution**: 
- Vercel serverless has file system limitations
- Use Cloudinary or AWS S3 for file storage
- Or deploy backend to Railway/Render

---

## 🎯 Recommended Setup

For best results, I recommend:

**Frontend**: Vercel (Perfect for React/Vite)
**Backend**: Railway or Render (Better for Node.js with file uploads)

### Why?
- ✅ Better file upload support
- ✅ No timeout limits
- ✅ Persistent file storage
- ✅ Easier MongoDB connection

---

## ✅ Post-Deployment Checklist

- [ ] Backend URL is accessible
- [ ] Frontend loads correctly
- [ ] Login works
- [ ] API calls succeed
- [ ] CORS configured
- [ ] Environment variables set
- [ ] MongoDB connected

---

## 📞 Need Help?

1. Check deployment logs in Vercel dashboard
2. Review error messages
3. Verify environment variables
4. Test API endpoints directly

**Your repository is ready!** Just follow the steps above. 🚀

