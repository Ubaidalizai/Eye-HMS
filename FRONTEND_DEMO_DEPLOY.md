# 🎨 Frontend Demo Deployment to Vercel

Simple guide to deploy **only the frontend** to Vercel for demo purposes.

---

## 🚀 Quick Deployment Steps

### Step 1: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repo `Ubaidalizai/Eye-HMS`
4. **Configure**:
   - **Root Directory**: `Frontend` ⚠️ **IMPORTANT**
   - **Framework**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)

5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these two variables:
   
   ```
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   VITE_IMAGE_BASE_URL=http://localhost:4000/public/img
   ```
   
   ⚠️ **Note**: If your backend is hosted elsewhere, replace `localhost:4000` with your backend URL

6. **Click**: "Deploy"
7. **Done!** Your frontend will be live at `https://your-app.vercel.app`

---

## 🔧 Backend Setup Options

Since you're only deploying frontend, you need a backend running. Choose one:

### Option 1: Local Backend (Easiest for Demo)

1. **Run backend locally**:
   ```bash
   cd Backend
   npm install
   npm run dev
   ```

2. **Use ngrok** to expose localhost (if needed):
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 4000
   # Copy the https URL (e.g., https://abc123.ngrok.io)
   ```

3. **Update Vercel environment variables** with ngrok URL:
   ```
   VITE_API_BASE_URL=https://abc123.ngrok.io/api/v1
   VITE_IMAGE_BASE_URL=https://abc123.ngrok.io/public/img
   ```

4. **Update backend CORS** (`Backend/app.js`):
   - Add your Vercel frontend URL to `FRONTEND_URL` environment variable

### Option 2: Host Backend Elsewhere (Recommended)

Deploy backend to:
- **Railway**: https://railway.app (Free, easy)
- **Render**: https://render.com (Free tier)
- Any Node.js hosting service

Then use that backend URL in Vercel environment variables.

---

## ⚙️ Environment Variables in Vercel

After deployment, you can update environment variables:

1. Go to **Project Settings** → **Environment Variables**
2. Update:
   - `VITE_API_BASE_URL` = Your backend URL + `/api/v1`
   - `VITE_IMAGE_BASE_URL` = Your backend URL + `/public/img`
3. **Redeploy** (automatic or manual)

---

## ✅ Quick Checklist

- [ ] Frontend deployed to Vercel
- [ ] Root Directory set to `Frontend`
- [ ] Environment variables added
- [ ] Backend running (local or hosted)
- [ ] CORS configured on backend
- [ ] Test login functionality

---

## 🧪 Testing

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Open browser console (F12)
3. Check for errors
4. Test login with demo accounts

---

## 🐛 Common Issues

### CORS Error
- **Fix**: Update backend `FRONTEND_URL` to include your Vercel domain
- Example: `FRONTEND_URL=https://your-app.vercel.app`

### API Not Found
- **Fix**: Check `VITE_API_BASE_URL` in Vercel settings
- Make sure backend is running and accessible

---

## 📝 That's It!

Your frontend is now live on Vercel! 🎉

**Remember**: Keep your backend running for the frontend to work.

