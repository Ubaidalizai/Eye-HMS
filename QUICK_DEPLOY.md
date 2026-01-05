# ⚡ Quick Deploy to Vercel

## 🎯 Fastest Way to Deploy

### 1. Frontend Deployment (5 minutes)

```bash
cd Frontend
vercel
```

**Or via Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory** to `Frontend`
4. Add environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend.vercel.app/api/v1`
   - `VITE_IMAGE_BASE_URL` = `https://your-backend.vercel.app/public/img`
5. Deploy!

### 2. Backend Deployment

**Option A: Vercel (Serverless)**
```bash
cd Backend
vercel
```

**Set Environment Variables in Vercel:**
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - Random secret key (32+ characters)
- `JWT_EXPIRES_IN` - `1d`
- `COOKIE_MAX_AGE` - `86400000`
- `FRONTEND_URL` - Your frontend Vercel URL
- `NODE_ENV` - `production`

**Option B: Railway (Recommended for Backend)**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select repository
4. Set root directory: `Backend`
5. Add environment variables
6. Deploy!

### 3. Update Frontend Environment Variables

After backend is deployed, update frontend environment variables with your backend URL.

---

## ✅ Checklist

- [ ] MongoDB Atlas database created
- [ ] Backend deployed and URL obtained
- [ ] Frontend environment variables updated
- [ ] Frontend deployed
- [ ] CORS configured correctly
- [ ] Test login with demo accounts

---

## 🎉 Done!

Your app should now be live! 🚀

