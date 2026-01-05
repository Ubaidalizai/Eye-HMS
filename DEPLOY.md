# 🚀 Deploy Frontend to Vercel

Simple guide to deploy the Eye-HMS frontend to Vercel.

---

## ⚡ Quick Deploy (5 minutes)

### Step 1: Deploy to Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repo `Ubaidalizai/Eye-HMS`
4. **Configure**:
   - **Root Directory**: `Frontend` ⚠️ **CRITICAL**
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `dist` (auto)
   - **Install Command**: `npm install` (auto)

5. **Environment Variables** (Click "Environment Variables"):
   ```
   VITE_API_BASE_URL=http://localhost:4000/api/v1
   VITE_IMAGE_BASE_URL=http://localhost:4000/public/img
   ```
   
   ⚠️ **Update these** if your backend is hosted elsewhere!

6. **Click**: "Deploy"
7. **Done!** Your app will be live at `https://your-app.vercel.app`

---

## 🔧 Backend Setup

The frontend needs a backend API. Choose one:

### Option 1: Run Backend Locally

```bash
cd Backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`

**For demo with external access**, use ngrok:
```bash
ngrok http 4000
# Copy the https URL and update Vercel environment variables
```

### Option 2: Host Backend Elsewhere

Deploy backend to:
- **Railway**: https://railway.app (Recommended - Free)
- **Render**: https://render.com (Free tier)
- **Any Node.js hosting**

Then update Vercel environment variables with your backend URL.

---

## ⚙️ Update Environment Variables

After deployment, update in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Update:
   - `VITE_API_BASE_URL` = `https://your-backend-url.com/api/v1`
   - `VITE_IMAGE_BASE_URL` = `https://your-backend-url.com/public/img`
3. **Redeploy** (automatic)

---

## ✅ Post-Deployment

1. Visit your Vercel URL
2. Test login (use demo accounts from `DEMO_CREDENTIALS.md`)
3. Check browser console for errors
4. Verify API calls work

---

## 🐛 Troubleshooting

**CORS Error?**
- Update backend `FRONTEND_URL` environment variable to include your Vercel domain

**404 Errors?**
- Check `VITE_API_BASE_URL` is correct
- Verify backend is running

**Build Fails?**
- Check Vercel build logs
- Verify Root Directory is set to `Frontend`

---

**That's it! Your frontend is live! 🎉**

