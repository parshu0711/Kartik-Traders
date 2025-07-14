const axios = require('axios');

async function testAdminLogin() {
  const testEmails = [
    'bharatkarwani70@gmail.com',
    'admin@kartiktraders.com', 
    'prashantmete0711@gmail.com'
  ];
  
  const password = '@Pass.07';
  const baseUrl = process.env.BASE_URL || 'https://kartik-traders.onrender.com';
  
  console.log('Testing admin login with these credentials:');
  console.log('Password:', password);
  console.log('Emails:', testEmails);
  console.log('Base URL:', baseUrl);
  console.log('---');
  
  for (const email of testEmails) {
    try {
      console.log(`Testing login for: ${email}`);
      const response = await axios.post(`${baseUrl}/api/auth/admin/login`, {
        email: email,
        password: password
      });
      
      console.log(`✅ SUCCESS: ${email} - Token: ${response.data.token ? 'Received' : 'Missing'}`);
      console.log(`   User: ${response.data.user.name} (${response.data.user.role})`);
    } catch (error) {
      console.log(`❌ FAILED: ${email}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log(`   Status: ${error.response?.status}`);
    }
    console.log('---');
  }
}

testAdminLogin().catch(console.error); 