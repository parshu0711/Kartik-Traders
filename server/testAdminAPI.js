const axios = require('axios');

async function testAdminAPI() {
  const baseUrl = 'https://kartik-traders.onrender.com';
  const testEmails = [
    'bharatkarwani70@gmail.com',
    'admin@kartiktraders.com',
    'prashantmete0711@gmail.com'
  ];
  const password = '@Pass.07';
  
  console.log('🧪 Testing Admin Login API...\n');
  console.log('Base URL:', baseUrl);
  console.log('Password:', password);
  console.log('---\n');
  
  for (const email of testEmails) {
    try {
      console.log(`Testing login for: ${email}`);
      
      const response = await axios.post(`${baseUrl}/api/auth/admin/login`, {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ SUCCESS: ${email}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Token: ${response.data.token ? 'Received' : 'Missing'}`);
      console.log(`   User: ${response.data.admin?.name || 'N/A'}`);
      
    } catch (error) {
      console.log(`❌ FAILED: ${email}`);
      console.log(`   Status: ${error.response?.status || 'No response'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log(`   Response:`, error.response.data);
      }
    }
    console.log('---\n');
  }
}

testAdminAPI().catch(console.error); 