const axios = require('axios');

async function createAdminOnDeployed() {
  const baseUrl = 'https://kartik-traders.onrender.com';
  
  console.log('🔧 Creating admin on deployed server...\n');
  
  // First, try to create admin using the create-admin endpoint
  try {
    console.log('1. Trying to create admin via API...');
    const response = await axios.post(`${baseUrl}/api/auth/create-admin`, {
      name: 'Admin User',
      email: 'admin@kartiktraders.com',
      password: '@Pass.07',
      phone: '1234567890'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin created via API:', response.data);
    
  } catch (error) {
    console.log('❌ Failed to create admin via API:', error.response?.data?.message || error.message);
  }
  
  // Then test the login
  console.log('\n2. Testing admin login...');
  try {
    const loginResponse = await axios.post(`${baseUrl}/api/auth/admin/login`, {
      email: 'admin@kartiktraders.com',
      password: '@Pass.07'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful:', loginResponse.data);
    
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
  }
}

createAdminOnDeployed().catch(console.error); 