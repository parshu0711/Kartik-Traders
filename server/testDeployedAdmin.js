const axios = require('axios');

async function testDeployedAdmin() {
  const baseUrl = 'https://kartik-traders.onrender.com';
  
  console.log('🧪 Testing Deployed Admin Login...\n');
  console.log('Base URL:', baseUrl);
  console.log('---\n');
  
  // Test 1: Check if the API endpoint exists
  try {
    console.log('1. Testing API endpoint availability...');
    const healthResponse = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Try admin login with different credentials
  const testCredentials = [
    { email: 'bharatkarwani70@gmail.com', password: '@Pass.07' },
    { email: 'admin@kartiktraders.com', password: '@Pass.07' },
    { email: 'prashantmete0711@gmail.com', password: '@Pass.07' },
    // Try some common variations
    { email: 'bharatkarwani70@gmail.com', password: 'admin123' },
    { email: 'admin@kartiktraders.com', password: 'admin123' },
    { email: 'admin@kartiktraders.com', password: 'password' }
  ];
  
  console.log('2. Testing admin login with different credentials...\n');
  
  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.email} / ${cred.password}`);
      
      const response = await axios.post(`${baseUrl}/api/auth/admin/login`, {
        email: cred.email,
        password: cred.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ SUCCESS: ${cred.email}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Token: ${response.data.token ? 'Received' : 'Missing'}`);
      console.log(`   User: ${response.data.admin?.name || response.data.user?.name || 'N/A'}`);
      
    } catch (error) {
      console.log(`❌ FAILED: ${cred.email}`);
      console.log(`   Status: ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
    console.log('---');
  }
  
  // Test 3: Check if there are any users in the database
  console.log('\n3. Checking if we can get user info...');
  try {
    const response = await axios.get(`${baseUrl}/api/users`);
    console.log('✅ Users endpoint accessible');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Users endpoint failed:', error.response?.data?.message || error.message);
  }
}

testDeployedAdmin().catch(console.error); 