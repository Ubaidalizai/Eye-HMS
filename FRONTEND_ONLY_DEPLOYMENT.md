# 🎨 Frontend-Only Deployment to Vercel

This guide shows how to deploy **only the frontend** to Vercel for demo purposes.

## 📋 Prerequisites

- Backend running somewhere (localhost, Railway, Render, or any hosting)
- Vercel account
- GitHub repository connected

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Frontend Configuration

The frontend is already configured to use environment variables. You just need to set them in Vercel.

### Step 2: Deploy Frontend to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to**: https://vercel.com/dashboard
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repository `Ubaidalizai/Eye-HMS`
4. **Configure Project**:
   - **Root Directory**: `Frontend` ⚠️ **IMPORTANT**
   - **Framework Preset**: **Vite** (should auto-detect)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api/v1
   VITE_IMAGE_BASE_URL=https://your-backend-url.com/public/img
   ```
   
   **Replace `your-backend-url.com` with:**
   - Your backend URL if hosted elsewhere
   - Or use ngrok/localhost tunnel for local backend
   - Or leave as `http://localhost:4000` if backend runs locally (CORS must allow your Vercel domain)

6. **Click**: "Deploy"
7. **Wait**: 1-2 minutes for deployment
8. **Copy**: Your frontend URL (e.g., `https://your-app.vercel.app`)

#### Option B: Via Vercel CLI

```bash
cd Frontend
vercel
# Follow prompts:
# - Set Root Directory: Frontend
# - Add environment variables when prompted
```

---

## 🔧 Backend Options

Since you're only deploying frontend, your backend needs to be accessible. Options:

### Option 1: Local Backend (For Demo)

1. **Run backend locally**:
   ```bash
   cd Backend
   npm run dev
   ```

2. **Use ngrok or similar** to expose localhost:
   ```bash
   ngrok http 4000
   # Copy the https URL (e.g., https://abc123.ngrok.io)
   ```

3. **Update Vercel environment variables**:
   ```
   VITE_API_BASE_URL=https://abc123.ngrok.io/api/v1
   VITE_IMAGE_BASE_URL=https://abc123.ngrok.io/public/img
   ```

4. **Update backend CORS** in `Backend/app.js`:
   ```javascript
   FRONTEND_URL=https://your-frontend.vercel.app,https://abc123.ngrok.io
   ```

### Option 2: Host Backend Elsewhere (Recommended)

Deploy backend to:
- **Railway**: https://railway.app (Free tier available)
- **Render**: https://render.com (Free tier available)
- **Heroku**: https://heroku.com
- **DigitalOcean**: https://digitalocean.com

Then use that backend URL in frontend environment variables.

### Option 3: Use Existing Backend

If you already have a backend hosted, just use that URL.

---

## ⚙️ Environment Variables Setup

### In Vercel Dashboard:

1. Go to your **Frontend project** → **Settings** → **Environment Variables**
2. Add these variables:

   | Variable | Value | Example |
   |----------|-------|---------|
   | `VITE_API_BASE_URL` | Your backend API URL | `https://api.example.com/api/v1` |
   | `VITE_IMAGE_BASE_URL` | Your backend images URL | `https://api.example.com/public/img` |

3. **Redeploy** after adding variables

---

## 🔒 CORS Configuration

Make sure your backend allows requests from your Vercel frontend:

### Update `Backend/app.js`:

```javascript
FRONTEND_URL=https://your-frontend.vercel.app,http://localhost:5173
```

Then redeploy backend (if hosted) or restart local backend.

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Environment variables set correctly
- [ ] Backend is accessible (test API endpoint)
- [ ] CORS configured on backend
- [ ] Frontend can make API calls
- [ ] Login functionality works
- [ ] Images load correctly

---

## 🧪 Testing

After deployment:

1. **Visit**: `https://your-app.vercel.app`
2. **Open Browser Console** (F12)
3. **Check for errors**:
   - CORS errors → Update backend CORS
   - 404 errors → Check API URL
   - Network errors → Verify backend is running

4. **Test Login**: Use demo accounts from `DEMO_CREDENTIALS.md`

---

## 🐛 Troubleshooting

### CORS Error
- **Solution**: Update backend `FRONTEND_URL` to include your Vercel domain
- **Example**: `FRONTEND_URL=https://your-app.vercel.app`

### API Not Found (404)
- **Solution**: Check `VITE_API_BASE_URL` in Vercel environment variables
- **Verify**: Backend is running and accessible

### Images Not Loading
- **Solution**: Check `VITE_IMAGE_BASE_URL` in Vercel environment variables
- **Verify**: Backend `/public/img` route is accessible

### Build Fails
- **Solution**: Check Vercel build logs
- **Common issues**: Missing dependencies, build errors

---

## 📝 Quick Reference

### Frontend Deployment:
- **Root Directory**: `Frontend`
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output**: `dist`

### Required Environment Variables:
```
VITE_API_BASE_URL=your_backend_url/api/v1
VITE_IMAGE_BASE_URL=your_backend_url/public/img
```

---

## 🎉 Success!

Once deployed, your frontend will be live at:
`https://your-app.vercel.app`

**Remember**: Keep your backend running (locally or hosted) for the frontend to work!

---

**Need help?** Check Vercel deployment logs for specific errors.

