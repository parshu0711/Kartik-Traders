require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');
const Product = require('./models/Product');

console.log('=== Testing Admin Product Creation Process ===');

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
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  testProductCreation();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

async function testProductCreation() {
  try {
    console.log('\n=== Testing Product Creation with Various Data ===');
    
    // Test 1: Basic product data
    const basicProduct = {
      name: 'Test Product Basic',
      description: 'Test description',
      price: 100,
      originalPrice: 120,
      category: 'Test Category',
      brand: 'Test Brand',
      images: ['https://res.cloudinary.com/dhkvphwgd/image/upload/v1752395569/kartik-traders/test/test-image.jpg'],
      stock: 10,
      sku: 'TEST-SKU-BASIC-' + Date.now(),
      isActive: true,
      isFeatured: false
    };

    console.log('Creating basic product...');
    const product1 = new Product(basicProduct);
    const savedProduct1 = await product1.save();
    console.log('✅ Basic product created successfully!');
    console.log('Product ID:', savedProduct1._id);
    
    // Clean up
    await Product.findByIdAndDelete(savedProduct1._id);
    console.log('✅ Basic product cleaned up');

    // Test 2: Product with all fields
    const fullProduct = {
      name: 'Test Product Full',
      description: 'Test description with more details',
      price: 150,
      originalPrice: 200,
      category: 'Custom Category',
      brand: 'Custom Brand',
      images: ['https://res.cloudinary.com/dhkvphwgd/image/upload/v1752395569/kartik-traders/test/test-image.jpg'],
      sizes: ['S', 'M', 'L'],
      sizeStock: [
        { size: 'S', stock: 5 },
        { size: 'M', stock: 10 },
        { size: 'L', stock: 8 }
      ],
      colors: ['Red', 'Blue'],
      stock: 25,
      sku: 'TEST-SKU-FULL-' + Date.now(),
      tags: ['test', 'sample'],
      material: 'Cotton',
      careInstructions: 'Machine wash cold',
      shippingWeight: 0.5,
      dimensions: { length: 10, width: 5, height: 2 },
      highlights: ['Comfortable', 'Durable'],
      fit: 'Regular',
      sleeveType: 'Short sleeve',
      occasion: 'Casual',
      isActive: true,
      isFeatured: false,
      discount: 10
    };

    console.log('\nCreating full product...');
    const product2 = new Product(fullProduct);
    const savedProduct2 = await product2.save();
    console.log('✅ Full product created successfully!');
    console.log('Product ID:', savedProduct2._id);
    
    // Clean up
    await Product.findByIdAndDelete(savedProduct2._id);
    console.log('✅ Full product cleaned up');

    console.log('\n✅ All tests passed! Product creation should work.');
    
  } catch (error) {
    console.log('❌ Error creating product:', error.message);
    console.log('Error stack:', error.stack);
    
    // Check for specific validation errors
    if (error.name === 'ValidationError') {
      console.log('\nValidation errors:');
      for (let field in error.errors) {
        console.log(`- ${field}: ${error.errors[field].message}`);
      }
    }
  } finally {
    mongoose.connection.close();
  }
} 