require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

console.log('=== Testing Product Creation ===');

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
    console.log('\n=== Testing Product Model ===');
    
    // Test product data
    const testProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      originalPrice: 120,
      category: 'Test Category',
      brand: 'Test Brand',
      images: ['https://res.cloudinary.com/dhkvphwgd/image/upload/v1752395569/kartik-traders/test/test-image.jpg'],
      stock: 10,
      sku: 'TEST-SKU-001',
      isActive: true,
      isFeatured: false
    };

    console.log('Creating test product...');
    const product = new Product(testProduct);
    const savedProduct = await product.save();
    
    console.log('✅ Product created successfully!');
    console.log('Product ID:', savedProduct._id);
    console.log('Product Name:', savedProduct.name);
    
    // Clean up - delete the test product
    await Product.findByIdAndDelete(savedProduct._id);
    console.log('✅ Test product cleaned up');
    
  } catch (error) {
    console.log('❌ Error creating product:', error.message);
    console.log('Error stack:', error.stack);
  } finally {
    mongoose.connection.close();
  }
} 