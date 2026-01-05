# 🚀 Eye-HMS Deployment Guide for Vercel

This guide will help you deploy the Eye-HMS application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Database**: 
   - Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (recommended for production)
   - Or any MongoDB hosting service
3. **GitHub Account**: For connecting your repository to Vercel

---

## 🏗️ Architecture

For production, we recommend:
- **Frontend**: Deploy on Vercel (Static Site)
- **Backend**: Deploy on Vercel (Serverless Functions) OR use a separate service like:
  - Railway
  - Render
  - Heroku
  - DigitalOcean

---

## 📦 Step 1: Prepare Your Code

### 1.1 Update Environment Variables

#### Frontend Environment Variables

Create `Frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api/v1
VITE_IMAGE_BASE_URL=https://your-backend-url.vercel.app/public/img
```

#### Backend Environment Variables

Create `Backend/.env` (or set in Vercel dashboard):
```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
COOKIE_MAX_AGE=86400000
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🎯 Step 2: Deploy Backend to Vercel

### Option A: Deploy Backend as Serverless Functions (Vercel)

1. **Install Vercel CLI** (if deploying via CLI):
   ```bash
   npm i -g vercel
   ```

2. **Navigate to Backend directory**:
   ```bash
   cd Backend
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Or connect via Vercel Dashboard:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Set Root Directory to `Backend`
   - Configure environment variables

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add all variables from `Backend/.env.example`

5. **Note**: For file uploads, you may need to use external storage (AWS S3, Cloudinary) as Vercel serverless functions have limitations.

### Option B: Deploy Backend to Railway/Render (Recommended)

**Railway**:
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect your GitHub repo
4. Set root directory to `Backend`
5. Add environment variables
6. Deploy

**Render**:
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repo
4. Set root directory to `Backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables

---

## 🎨 Step 3: Deploy Frontend to Vercel

1. **Navigate to Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   
   Or via Dashboard:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your repository
   - Set Root Directory to `Frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**:
   - `VITE_API_BASE_URL`: Your backend URL
   - `VITE_IMAGE_BASE_URL`: Your backend URL + `/public/img`

---

## ⚙️ Step 4: Configure CORS

Update `Backend/app.js` CORS configuration to include your frontend URL:

```javascript
FRONTEND_URL=https://your-frontend.vercel.app,http://localhost:5173
```

---

## 🔒 Step 5: Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set secure cookie flags in production
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Remove demo accounts or change passwords
- [ ] Enable rate limiting (already configured)
- [ ] Review and update CORS origins

---

## 📝 Step 6: MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for Vercel)
5. Get connection string
6. Update `MONGO_URI` in environment variables

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

---

## 🧪 Step 7: Test Deployment

1. **Test Frontend**: Visit your Vercel frontend URL
2. **Test Backend**: 
   - Check API health: `https://your-backend.vercel.app/api/v1/health`
   - Test login endpoint
3. **Test File Uploads**: If using external storage, test image uploads
4. **Test Authentication**: Login with demo accounts

---

## 🔄 Step 8: Continuous Deployment

Vercel automatically deploys on:
- Push to main/master branch
- Pull request creation
- Manual deployment trigger

---

## 🐛 Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` environment variable
- Ensure backend CORS includes frontend URL
- Check browser console for specific errors

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Verify database user credentials

### Build Failures
- Check Node.js version (Vercel uses Node 18+ by default)
- Review build logs in Vercel dashboard
- Ensure all dependencies are in package.json

### Environment Variables Not Working
- Restart deployment after adding variables
- Check variable names (case-sensitive)
- Verify VITE_ prefix for frontend variables

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

## 🎉 Success!

Once deployed, your Eye-HMS application will be live and accessible worldwide!

**Frontend URL**: `https://your-app.vercel.app`  
**Backend URL**: `https://your-backend.vercel.app`

---

**Need Help?** Check the logs in Vercel dashboard for detailed error messages.

