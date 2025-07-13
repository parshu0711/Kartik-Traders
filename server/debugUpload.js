require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

console.log('=== Debug Upload Configuration ===');

// Check environment variables
console.log('Environment variables:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                              process.env.CLOUDINARY_API_KEY && 
                              process.env.CLOUDINARY_API_SECRET;

console.log('\nIs Cloudinary configured:', isCloudinaryConfigured);

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Test Cloudinary storage configuration
  try {
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'kartik-traders/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
      },
    });

    console.log('✅ Cloudinary storage configured successfully');
    
    // Test upload
    const upload = multer({ storage });
    console.log('✅ Multer upload configured successfully');
    
  } catch (error) {
    console.log('❌ Error configuring Cloudinary storage:', error.message);
  }
} else {
  console.log('❌ Cloudinary not configured, will use local storage');
  
  // Test local storage
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
  });

  const upload = multer({ storage });
  console.log('✅ Local storage configured successfully');
}

console.log('\n=== Debug Complete ===');
console.log('If you see any errors above, that\'s likely the cause of your server error.'); 