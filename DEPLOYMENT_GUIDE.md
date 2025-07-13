# 🚀 Deployment Guide for Kartik Traders

## 📋 **Environment Variables Setup**

### **Frontend Environment Variables**

Create a `.env.local` file in the `client` folder:

```env
# For development (optional - will auto-detect)
VITE_API_URL=http://localhost:5000

# For production (set in hosting platform)
VITE_API_URL=https://your-backend-domain.com
```

### **Backend Environment Variables**

Create a `.env` file in the `server` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database (Use MongoDB Atlas for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kartik-traders

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Backend URL (optional)
BACKEND_URL=https://your-backend-domain.com

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🌐 **How the Dynamic URLs Work**

### **Frontend (React/Vite)**
```javascript
// Automatically detects environment
const isDevelopment = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL || 
  (isDevelopment ? 'http://localhost:5000' : window.location.origin);
```

### **Backend (Node.js/Express)**
```javascript
// Automatically detects environment
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.BACKEND_URL || 
           process.env.FRONTEND_URL?.replace('https://', 'https://api.') || 
           'https://your-backend-domain.com';
  }
  return 'http://localhost:5000';
};
```

## 🎯 **Deployment Platforms**

### **Option 1: Vercel + Railway (Recommended)**

#### **Frontend (Vercel)**
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: `https://your-railway-app.railway.app`

#### **Backend (Railway)**
1. Connect your GitHub repository
2. Set start command: `cd server && npm start`
3. Add environment variables in Railway dashboard:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Your secure JWT secret
   - `FRONTEND_URL`: `https://your-vercel-app.vercel.app`

### **Option 2: Netlify + Render**

#### **Frontend (Netlify)**
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Add environment variables in Netlify dashboard

#### **Backend (Render)**
1. Connect your GitHub repository
2. Set start command: `cd server && npm start`
3. Add environment variables in Render dashboard

## 🔧 **Database Setup**

### **MongoDB Atlas (Recommended)**
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user
4. Get connection string
5. Add to environment variables

### **Local MongoDB (Development Only)**
```bash
# Install MongoDB locally
# Connection string: mongodb://localhost:27017/kartik-traders
```

## 📁 **File Structure for Deployment**

```
Project/
├── client/          # Frontend (React/Vite)
│   ├── .env.local   # Frontend environment variables
│   └── dist/        # Build output (auto-generated)
└── server/          # Backend (Node.js/Express)
    ├── .env         # Backend environment variables
    └── uploads/     # Image uploads directory
```

## 🚀 **Deployment Steps**

### **1. Prepare Your Code**
```bash
# Frontend
cd client
npm install
npm run build

# Backend
cd server
npm install
```

### **2. Set Up Database**
- Create MongoDB Atlas cluster
- Get connection string
- Add to environment variables

### **3. Deploy Backend First**
- Deploy to Railway/Render/Heroku
- Set all environment variables
- Test API endpoints

### **4. Deploy Frontend**
- Deploy to Vercel/Netlify
- Set `VITE_API_URL` to your backend URL
- Test the application

### **5. Test Everything**
- Test user registration/login
- Test product browsing
- Test order placement
- Test admin functions

## 🔒 **Security Checklist**

- [ ] Use strong JWT secret
- [ ] Use MongoDB Atlas (not local)
- [ ] Set proper CORS origins
- [ ] Use HTTPS in production
- [ ] Set up proper environment variables
- [ ] Test all functionality after deployment

## 🐛 **Troubleshooting**

### **Common Issues**
1. **CORS errors**: Check `FRONTEND_URL` in backend environment
2. **Image not loading**: Check `BACKEND_URL` in backend environment
3. **API calls failing**: Check `VITE_API_URL` in frontend environment
4. **Database connection**: Check `MONGODB_URI` format

### **Debug Commands**
```bash
# Check backend health
curl https://your-backend-domain.com/api/health

# Check frontend build
cd client && npm run build

# Check environment variables
echo $NODE_ENV
```

## 📞 **Support**

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test API endpoints individually
4. Check CORS configuration
5. Verify database connection

---

**Your application is now ready for deployment! 🎉** 