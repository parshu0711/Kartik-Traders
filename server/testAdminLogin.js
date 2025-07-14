const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database');
    
    // Test email
    const testEmail = 'admin@kartiktraders.com';
    const testPassword = '@Pass.07';
    
    console.log(`\n🔍 Looking for admin with email: ${testEmail}`);
    
    // Find the admin user
    const admin = await User.findOne({ email: testEmail, role: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({});
      allUsers.forEach(user => {
        console.log(`- ${user.email} (role: ${user.role}, active: ${user.isActive})`);
      });
      return;
    }
    
    console.log('✅ Admin user found!');
    console.log(`- Name: ${admin.name}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Active: ${admin.isActive}`);
    console.log(`- Password hash: ${admin.password.substring(0, 20)}...`);
    
    // Test password comparison
    console.log(`\n🔍 Testing password: ${testPassword}`);
    const isMatch = await admin.comparePassword(testPassword);
    console.log(`Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
    
    // Also test with bcrypt directly
    const directMatch = await bcrypt.compare(testPassword, admin.password);
    console.log(`Direct bcrypt match: ${directMatch ? '✅ YES' : '❌ NO'}`);
    
    // Test with different password
    const wrongPassword = 'wrongpassword';
    const wrongMatch = await admin.comparePassword(wrongPassword);
    console.log(`Wrong password match: ${wrongMatch ? '❌ YES (should be NO)' : '✅ NO'}`);
    
    if (isMatch) {
      console.log('\n🎉 Admin login should work!');
    } else {
      console.log('\n❌ Password comparison failed. Possible issues:');
      console.log('1. Password hash in database is incorrect');
      console.log('2. Password comparison method has issues');
      console.log('3. Database connection issue');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testAdminLogin(); 