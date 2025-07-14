const axios = require('axios');

async function checkDeployedVersion() {
  const baseUrl = 'https://kartik-traders.onrender.com';
  
  console.log('🔍 Checking deployed server version...\n');
  
  try {
    // Check health endpoint
    console.log('1. Health check...');
    const healthResponse = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ Health:', healthResponse.data);
    
    // Check if admin creation endpoint exists
    console.log('\n2. Testing admin creation endpoint...');
    try {
      const createResponse = await axios.post(`${baseUrl}/api/auth/create-admin`, {
        name: 'Test Admin',
        email: 'test@test.com',
        password: 'test123',
        phone: '1234567890'
      });
      console.log('✅ Create admin endpoint works:', createResponse.data);
    } catch (error) {
      console.log('❌ Create admin endpoint failed:', error.response?.data?.message || error.message);
    }
    
    // Check if we can get any users
    console.log('\n3. Testing users endpoint...');
    try {
      const usersResponse = await axios.get(`${baseUrl}/api/users`);
      console.log('✅ Users endpoint works');
    } catch (error) {
      console.log('❌ Users endpoint failed:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkDeployedVersion().catch(console.error); 