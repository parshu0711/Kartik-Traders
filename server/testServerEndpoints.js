require('dotenv').config();
const axios = require('axios');

console.log('=== Testing Admin Endpoints ===');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  try {
    console.log('Testing server at:', BASE_URL);
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${BASE_URL}/api/health`);
      console.log('✅ Health endpoint working:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.message);
    }
    
    // Test products endpoint (public)
    try {
      const productsResponse = await axios.get(`${BASE_URL}/api/products`);
      console.log('✅ Products endpoint working:', productsResponse.data.products ? productsResponse.data.products.length : 0, 'products found');
    } catch (error) {
      console.log('❌ Products endpoint failed:', error.message);
    }
    
    // Test admin stats endpoint (requires auth)
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/admin/stats`);
      console.log('✅ Admin stats endpoint working:', statsResponse.data);
    } catch (error) {
      console.log('❌ Admin stats endpoint failed (expected without auth):', error.response?.status);
    }
    
    console.log('\n✅ Server endpoints test completed!');
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
}

testEndpoints(); 