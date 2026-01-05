# 👁️ Eye-HMS - Hospital Management System

A comprehensive Hospital Management System built with React, Node.js, and MongoDB for managing eye hospital operations including patient records, inventory, pharmacy, finances, and more.

## 🚀 Quick Deploy (Frontend Only)

**Deploy frontend to Vercel in 5 minutes!** See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

---

## 🚀 Features

- **User Management**: Role-based access control (Admin, Doctor, Pharmacist, Receptionist)
- **Patient Management**: Complete patient records and history
- **Inventory Management**: Product tracking, purchases, and sales
- **Pharmacy Management**: Drug inventory and sales tracking
- **Financial Management**: Income, expenses, and financial reports
- **Dashboard**: Real-time analytics and summaries
- **Multiple Branches**: OPD, OCT, Laboratory, Operation, B-Scan, and more
- **Reports**: Daily summaries, income reports, and analytics

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Chart.js
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File Uploads)
- Bcrypt (Password Hashing)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup (For Local Development)

```bash
cd Backend
npm install
```

Create a `.env` file:
```env
NODE_ENV=development
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
COOKIE_MAX_AGE=86400000
FRONTEND_URL=http://localhost:5173
```

Run the backend:
```bash
npm run dev
```

### Frontend Setup

```bash
cd Frontend
npm install
```

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_IMAGE_BASE_URL=http://localhost:4000/public/img
```

Run the frontend:
```bash
npm run dev
```

## 🎯 Demo Accounts

See [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md) for demo account credentials.

All demo accounts use password: `demo123`

## 🚀 Deployment

### Frontend Deployment (Vercel)

**See [DEPLOY.md](./DEPLOY.md) for detailed frontend deployment instructions.**

Quick steps:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set **Root Directory** to `Frontend`
4. Add environment variables
5. Deploy!

### Backend Deployment (Optional)

The backend can be deployed separately to:
- Railway: https://railway.app (Recommended)
- Render: https://render.com
- Heroku: https://heroku.com
- Any Node.js hosting service

## 📁 Project Structure

```
Eye-HMS/
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Auth and other middlewares
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── utils/           # Helper functions
│   └── server.js         # Server entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── config/      # Configuration files
│   │   └── utils/        # Utility functions
│   └── public/          # Static assets
│
└── README.md
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- XSS protection
- SQL injection protection
- Helmet.js security headers

## 📝 Scripts

### Backend
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run setup:demo` - Create demo accounts
- `npm run setup:admin` - Create admin account

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Eye-HMS Development Team

## 🙏 Acknowledgments

- All contributors and testers
- Open source libraries and frameworks used

---

**For frontend deployment, see [DEPLOY.md](./DEPLOY.md)**  
**For demo credentials, see [DEMO_CREDENTIALS.md](./DEMO_CREDENTIALS.md)**
