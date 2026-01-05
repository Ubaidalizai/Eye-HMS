# ⚙️ Vercel Environment Variables Setup

Your frontend is deployed at: **https://eye-hms-hwya.vercel.app**

To make login work, you need to set environment variables in Vercel.

---

## 🔧 Step 1: Set Environment Variables in Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project `eye-hms-hwya`
3. **Go to**: Settings → Environment Variables
4. **Add these two variables**:

### Variable 1:
- **Name**: `VITE_API_BASE_URL`
- **Value**: `http://localhost:4000/api/v1` (or your backend URL)
- **Environment**: Production, Preview, Development (select all)

### Variable 2:
- **Name**: `VITE_IMAGE_BASE_URL`
- **Value**: `http://localhost:4000/public/img` (or your backend URL)
- **Environment**: Production, Preview, Development (select all)

5. **Click**: "Save"
6. **Redeploy**: Go to Deployments → Latest → ... → Redeploy

---

## 🔗 Backend Options

### Option 1: Local Backend with ngrok (For Demo)

1. **Run backend locally**:
   ```bash
   cd Backend
   npm run dev
   ```

2. **Install and run ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   ngrok http 4000
   ```

3. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

4. **Update Vercel environment variables**:
   ```
   VITE_API_BASE_URL=https://abc123.ngrok.io/api/v1
   VITE_IMAGE_BASE_URL=https://abc123.ngrok.io/public/img
   ```

5. **Update backend CORS** (`Backend/app.js`):
   - Add to `FRONTEND_URL`: `https://eye-hms-hwya.vercel.app`

6. **Redeploy frontend** (automatic after env var change)

### Option 2: Host Backend on Railway/Render

1. **Deploy backend to Railway** (https://railway.app):
   - New Project → Deploy from GitHub
   - Root Directory: `Backend`
   - Add environment variables
   - Deploy

2. **Get backend URL** (e.g., `https://your-app.railway.app`)

3. **Update Vercel environment variables**:
   ```
   VITE_API_BASE_URL=https://your-app.railway.app/api/v1
   VITE_IMAGE_BASE_URL=https://your-app.railway.app/public/img
   ```

4. **Update backend CORS** to include: `https://eye-hms-hwya.vercel.app`

---

## ✅ After Setting Environment Variables

1. **Redeploy** (automatic or manual)
2. **Wait 1-2 minutes**
3. **Test login** at: https://eye-hms-hwya.vercel.app/login

**Demo Accounts** (from `DEMO_CREDENTIALS.md`):
- Email: `admin@demo.com` / Password: `demo123`
- Email: `doctor@demo.com` / Password: `demo123`
- Email: `pharmacist@demo.com` / Password: `demo123`
- Email: `receptionist@demo.com` / Password: `demo123`

---

## 🐛 Troubleshooting

### Login fails / CORS error
- **Fix**: Update backend `FRONTEND_URL` to include `https://eye-hms-hwya.vercel.app`
- **Restart backend** (if local) or **redeploy backend** (if hosted)

### API not found (404)
- **Check**: `VITE_API_BASE_URL` is correct in Vercel
- **Verify**: Backend is running and accessible
- **Test**: Visit backend URL directly in browser

### Network error
- **Check**: Backend is running
- **Verify**: Backend URL is accessible
- **Check**: CORS is configured correctly

---

## 📝 Quick Checklist

- [ ] Environment variables set in Vercel
- [ ] Backend is running (local or hosted)
- [ ] Backend CORS includes Vercel domain
- [ ] Frontend redeployed after env var changes
- [ ] Test login with demo accounts

---

**Your frontend URL**: https://eye-hms-hwya.vercel.app/login

Set the environment variables and redeploy to enable login! 🚀

