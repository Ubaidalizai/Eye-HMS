# ✅ Production Deployment Checklist

## 🔐 Security

- [ ] Change all demo account passwords
- [ ] Generate strong JWT_SECRET (32+ random characters)
- [ ] Update MongoDB connection string
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Review CORS origins (remove localhost in production)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Review rate limiting settings
- [ ] Remove or secure admin scripts

## 🌐 Environment Variables

### Backend (.env or Vercel Dashboard)
- [ ] `NODE_ENV=production`
- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Strong random secret
- [ ] `JWT_EXPIRES_IN=1d`
- [ ] `COOKIE_MAX_AGE=86400000`
- [ ] `FRONTEND_URL` - Your frontend production URL
- [ ] `PORT=4000` (or let Vercel assign)

### Frontend (Vercel Dashboard)
- [ ] `VITE_API_BASE_URL` - Your backend production URL
- [ ] `VITE_IMAGE_BASE_URL` - Your backend production URL + `/public/img`

## 📦 Build Configuration

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend dependencies installed
- [ ] No console errors in build logs
- [ ] Environment variables properly set

## 🗄️ Database

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] IP whitelist configured (0.0.0.0/0 for Vercel)
- [ ] Connection string tested
- [ ] Backup strategy in place

## 🚀 Deployment

- [ ] Backend deployed to Vercel/Railway/Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both
- [ ] CORS configured correctly
- [ ] API endpoints accessible

## 🧪 Testing

- [ ] Frontend loads correctly
- [ ] Login works with production accounts
- [ ] API calls succeed
- [ ] File uploads work (if applicable)
- [ ] Images load correctly
- [ ] All routes accessible
- [ ] No console errors

## 📊 Monitoring

- [ ] Error logging configured
- [ ] Performance monitoring set up
- [ ] Uptime monitoring enabled
- [ ] Database monitoring active

## 📝 Documentation

- [ ] README.md updated
- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] API documentation available

## 🔄 Post-Deployment

- [ ] Test all user roles
- [ ] Verify data persistence
- [ ] Check file uploads/downloads
- [ ] Test on mobile devices
- [ ] Verify SSL certificates
- [ ] Set up custom domain (optional)

---

## 🚨 Common Issues

### CORS Errors
- Check `FRONTEND_URL` includes your frontend domain
- Verify CORS middleware configuration

### Database Connection
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Verify database user credentials

### Build Failures
- Check Node.js version compatibility
- Review build logs for specific errors
- Verify all dependencies in package.json

### Environment Variables
- Restart deployment after adding variables
- Check variable names (case-sensitive)
- Verify VITE_ prefix for frontend variables

---

**Ready for Production?** ✅

Once all items are checked, your application is production-ready!

