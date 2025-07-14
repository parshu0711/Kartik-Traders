const axios = require('axios');

async function forceUpdateAdminPassword() {
  const baseUrl = 'https://kartik-traders.onrender.com';
  
  console.log('🔧 Force updating admin password on deployed server...\n');
  
  const adminData = {
    email: 'admin@kartiktraders.com',
    password: '@Pass.07'
  };
  
  try {
    console.log('1. Force updating admin password...');
    console.log('Admin data:', adminData);
    
    const response = await axios.post(`${baseUrl}/api/auth/force-update-admin`, adminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin password updated successfully!');
    console.log('Response:', response.data);
    
    // Test login immediately
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${baseUrl}/api/auth/admin/login`, {
      email: adminData.email,
      password: adminData.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Admin login successful!');
    console.log('Login response:', loginResponse.data);
    
    console.log('\n🎉 SUCCESS! You can now login with:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    
    if (error.response?.data) {
      console.log('Full error response:', error.response.data);
    }
  }
}

forceUpdateAdminPassword(); 