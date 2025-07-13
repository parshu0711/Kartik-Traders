require('dotenv').config();
const axios = require('axios');

console.log('=== Testing Server Response ===');

async function testServer() {
  try {
    console.log('Testing server at http://localhost:5000');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health endpoint working:', healthResponse.data);
    
    // Test products endpoint
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    console.log('✅ Products endpoint working:', productsResponse.data.products ? productsResponse.data.products.length : 0, 'products found');
    
    console.log('\n✅ Server is responding correctly!');
    
  } catch (error) {
    console.log('❌ Server error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Server is not running. Please start the server with: npm start');
    } else if (error.response) {
      console.log('Server responded with error:', error.response.status, error.response.data);
    }
  }
}

testServer(); 