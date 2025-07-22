const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Create logs directory if it doesn't exist
const logDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, 'app.log'),
    { flags: 'a' }
);

// Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Dynamic CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://kartik-traders-1.onrender.com',  // Your Render frontend
          // Keep if using Netlify for frontend
    ].filter(Boolean) // Remove undefined values
  : ['http://localhost:3000', 'http://localhost:5173'];

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // allow more requests in development
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kartik Traders API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from the React app build directory
// if (process.env.NODE_ENV === 'production') {
//   const clientDistPath = path.join(__dirname, '../client/dist');
  
//   // Check if the client/dist directory exists
//   if (fs.existsSync(clientDistPath)) {
//     // Serve static files from the React app
//     app.use(express.static(clientDistPath));

//     // Handle React routing, return all requests to React app
//     app.get('*', (req, res) => {
//       res.sendFile(path.join(clientDistPath, 'index.html'));
//     });
//   } else {
//     console.log('Warning: client/dist directory not found. SPA routing disabled.');
//     // Fallback 404 handler for production without frontend
//     app.use('*', (req, res) => {
//       res.status(404).json({ message: 'Route not found' });
//     });
//   }
// }

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack || err.message || err);
  const errorMessage = err.stack || err.message || err.toString() || 'Unknown error';
  fs.appendFileSync(path.join(logDirectory, 'error.log'), `${new Date().toISOString()} - ${errorMessage}\n`);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create admins in production
  if (process.env.NODE_ENV === 'production') {
    try {
      const bcrypt = require('bcryptjs');
      const User = require('./models/User');
      
      const admins = [
        { name: 'Admin 1', email: 'bharatkarwani70@gmail.com', phone: '1111111111' },
        { name: 'Admin 2', email: 'admin@kartiktraders.com', phone: '2222222222' },
        { name: 'Admin 3', email: 'prashantmete0711@gmail.com', phone: '3333333333' }
      ];
      const password = '@Pass.07';
      
      console.log('🔧 Setting up admin accounts...');
      
      for (const admin of admins) {
        let user = await User.findOne({ email: admin.email });
        
        
        if (!user) {
          // Create new admin
          await User.create({
            name: admin.name,
            email: admin.email,
            password: password,
            phone: admin.phone,
            role: 'admin'
          });
          console.log(`✅ Created admin: ${admin.email}`);
        } else {
          // Force update existing admin password
          user.name = admin.name;
          user.password = password; // Force update password
          user.phone = admin.phone;
          user.role = 'admin';
          user.isActive = true;
          await user.save();
          console.log(`✅ Updated admin password: ${admin.email}`);
        }
      }
      console.log('🎉 Admin setup complete!');
    } catch (error) {
      console.error('Error setting up admins:', error);
    }
  }
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
}); 
