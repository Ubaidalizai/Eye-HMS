# 🔧 Vercel Deployment Fix Guide

## Issues Fixed

### 1. Serverless Function Handler
- Updated `Backend/api/index.js` to properly handle Vercel serverless functions
- Added database connection caching for serverless environments

### 2. Database Connection
- Updated `Backend/config/db.js` to cache connections (important for serverless)
- Prevents connection issues in Vercel's serverless environment

### 3. Vercel Configuration
- Updated `Backend/vercel.json` to properly route API requests

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import your GitHub repository**: `Ubaidalizai/Eye-HMS`
4. **Configure Project**:
   - **Root Directory**: `Backend`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_32_chars_minimum
   JWT_EXPIRES_IN=1d
   COOKIE_MAX_AGE=86400000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

6. **Deploy**

### Step 2: Deploy Frontend

1. **Add New Project** in Vercel
2. **Import same repository**: `Ubaidalizai/Eye-HMS`
3. **Configure Project**:
   - **Root Directory**: `Frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-url.vercel.app/api/v1
   VITE_IMAGE_BASE_URL=https://your-backend-url.vercel.app/public/img
   ```

5. **Deploy**

### Step 3: Update Backend CORS

After frontend is deployed, update backend environment variable:
- Go to Backend project settings
- Update `FRONTEND_URL` with your frontend URL
- Redeploy backend

---

## ⚠️ Important Notes

### File Uploads
Vercel serverless functions have limitations for file uploads. Consider:
- Using **Cloudinary** or **AWS S3** for image storage
- Or deploy backend to **Railway** or **Render** instead

### MongoDB Atlas
- Make sure MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs)
- Or add Vercel's IP ranges

### Static Files
- Static files in `/public` folder need to be handled differently
- Consider using external storage (Cloudinary, S3) for production

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Make sure `Root Directory` is set correctly
- Check that `package.json` exists in the root directory

### Error: "Database connection failed"
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure connection string includes database name

### Error: "CORS error"
- Update `FRONTEND_URL` in backend environment variables
- Check CORS configuration in `Backend/app.js`

### Error: "Function timeout"
- Vercel free tier has 10s timeout
- Consider upgrading or using Railway/Render for backend

---

## 📝 Alternative: Deploy Backend to Railway

If you encounter issues with Vercel serverless:

1. **Go to Railway**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select repository**: `Ubaidalizai/Eye-HMS`
4. **Set Root Directory**: `Backend`
5. **Add Environment Variables** (same as above)
6. **Deploy**

Then update frontend `VITE_API_BASE_URL` to Railway URL.

---

## ✅ Success Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] Environment variables set correctly
- [ ] MongoDB connection working
- [ ] CORS configured properly
- [ ] Login functionality tested
- [ ] API endpoints accessible

---

**Need help?** Check Vercel deployment logs for specific error messages.

