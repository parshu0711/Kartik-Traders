const axios = require('axios');

const testAdminLogin = async () => {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@kartiktraders.com',
      password: 'admin123'
    });
    
    console.log('Admin login successful!');
    console.log('Response:', response.data);
    
    // Test the token by accessing a protected route
    const token = response.data.token;
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Profile access successful!');
    console.log('Profile:', profileResponse.data);
    
  } catch (error) {
    console.error('Admin login test failed:', error.response?.data || error.message);
  }
};

testAdminLogin(); 