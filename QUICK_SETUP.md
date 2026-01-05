# ⚡ Quick Setup for Login to Work

Your frontend is live at: **https://eye-hms-hwya.vercel.app/login**

To enable login, follow these steps:

---

## 🔧 Step 1: Set Environment Variables in Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click**: Your project `eye-hms-hwya`
3. **Click**: Settings (top right)
4. **Click**: Environment Variables (left sidebar)
5. **Add these 2 variables**:

### Variable 1:
```
Name: VITE_API_BASE_URL
Value: http://localhost:4000/api/v1
Environment: Production, Preview, Development (select all)
```

### Variable 2:
```
Name: VITE_IMAGE_BASE_URL
Value: http://localhost:4000/public/img
Environment: Production, Preview, Development (select all)
```

6. **Click**: "Save"
7. **Redeploy**: 
   - Go to "Deployments" tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

## 🖥️ Step 2: Run Backend Locally

Open a new terminal and run:

```bash
cd Backend
npm run dev
```

Backend will run on `http://localhost:4000`

**⚠️ Important**: For the deployed frontend to connect to localhost, you need ngrok (see Step 3)

---

## 🌐 Step 3: Expose Local Backend with ngrok

1. **Download ngrok**: https://ngrok.com/download
2. **Run ngrok**:
   ```bash
   ngrok http 4000
   ```
3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Update Vercel Environment Variables**:
   - Go back to Vercel → Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to: `https://abc123.ngrok.io/api/v1`
   - Update `VITE_IMAGE_BASE_URL` to: `https://abc123.ngrok.io/public/img`
   - Save and Redeploy

5. **Update Backend CORS**:
   - Open `Backend/app.js`
   - Update `FRONTEND_URL` environment variable to include:
     ```
     FRONTEND_URL=https://eye-hms-hwya.vercel.app,http://localhost:5173
     ```
   - Restart backend

---

## ✅ Step 4: Test Login

1. **Visit**: https://eye-hms-hwya.vercel.app/login
2. **Use demo account**:
   - Email: `admin@demo.com`
   - Password: `demo123`
3. **Click**: "Sign in"
4. **Should redirect** to dashboard after successful login!

---

## 🎯 Demo Accounts

All use password: `demo123`

- **Admin**: `admin@demo.com`
- **Doctor**: `doctor@demo.com`
- **Pharmacist**: `pharmacist@demo.com`
- **Receptionist**: `receptionist@demo.com`

---

## 🐛 Troubleshooting

### "Network Error" or "Failed to fetch"
- ✅ Backend is running (`npm run dev` in Backend folder)
- ✅ ngrok is running and showing active tunnel
- ✅ Environment variables updated in Vercel
- ✅ Frontend redeployed after env var changes

### "CORS Error"
- ✅ Update backend `FRONTEND_URL` to include `https://eye-hms-hwya.vercel.app`
- ✅ Restart backend

### Login works but shows errors
- ✅ Check browser console (F12) for specific errors
- ✅ Verify backend API endpoints are working

---

## 📝 Summary

1. ✅ Set environment variables in Vercel
2. ✅ Run backend locally (`npm run dev`)
3. ✅ Run ngrok (`ngrok http 4000`)
4. ✅ Update Vercel env vars with ngrok URL
5. ✅ Update backend CORS
6. ✅ Test login!

**Your frontend is ready! Just connect it to a backend! 🚀**

