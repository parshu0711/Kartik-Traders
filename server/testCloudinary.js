require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('=== Cloudinary Connection Test ===');

// Check if environment variables are loaded
console.log('Environment variables:');
console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('\n=== Testing Cloudinary Connection ===');

// Test connection by uploading a simple test image
async function testCloudinary() {
  try {
    console.log('Attempting to upload test image...');
    
    // Upload a test image (using a sample image URL)
    const result = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      {
        public_id: 'kartik-traders-test-' + Date.now(),
        folder: 'kartik-traders/test'
      }
    );
    
    console.log('✅ SUCCESS: Cloudinary connection working!');
    console.log('Uploaded image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Clean up - delete the test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image cleaned up successfully');
    
  } catch (error) {
    console.log('❌ ERROR: Cloudinary connection failed');
    console.log('Error details:', error.message);
  }
}

testCloudinary(); 