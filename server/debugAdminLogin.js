const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function debugAdminLogin() {
  try {
    console.log('🔍 Debugging Admin Login Issues...\n');
    
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Database connected successfully\n');
    
    // 2. Check all users in database
    console.log('2. Checking all users in database...');
    const allUsers = await User.find({});
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.email} (role: ${user.role}, active: ${user.isActive})`);
    });
    console.log('');
    
    // 3. Check specific admin users
    console.log('3. Checking admin users...');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Total admins: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`- ${admin.email} (name: ${admin.name}, active: ${admin.isActive})`);
    });
    console.log('');
    
    // 4. Test specific admin credentials
    const testEmails = [
      'bharatkarwani70@gmail.com',
      'admin@kartiktraders.com',
      'prashantmete0711@gmail.com'
    ];
    const testPassword = '@Pass.07';
    
    console.log('4. Testing admin credentials...');
    for (const email of testEmails) {
      console.log(`\nTesting: ${email}`);
      const user = await User.findOne({ email: email });
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      console.log(`✅ User found: ${user.name} (role: ${user.role})`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      
      // Test password comparison
      const isMatch = await user.comparePassword(testPassword);
      console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      // Also test with bcrypt directly
      const directMatch = await bcrypt.compare(testPassword, user.password);
      console.log(`   Direct bcrypt match: ${directMatch ? '✅ YES' : '❌ NO'}`);
      
      if (user.role !== 'admin') {
        console.log(`⚠️  User is not an admin (role: ${user.role})`);
      }
    }
    
    // 5. Test creating a new admin if none exist
    if (adminUsers.length === 0) {
      console.log('\n5. No admin users found. Creating test admin...');
      const hash = await bcrypt.hash(testPassword, 10);
      const newAdmin = await User.create({
        name: 'Test Admin',
        email: 'admin@kartiktraders.com',
        password: hash,
        phone: '1234567890',
        role: 'admin'
      });
      console.log(`✅ Created admin: ${newAdmin.email}`);
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Check if admin users exist in database');
    console.log('- Verify password hashing is working');
    console.log('- Ensure admin role is set correctly');
    console.log('- Test the actual API endpoint');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

debugAdminLogin(); 