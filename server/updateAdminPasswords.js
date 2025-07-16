const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function updateAdminPasswords() {
  try {
    console.log('🔧 Updating admin passwords...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const admins = [
      { name: 'Admin 1', email: 'bharatkarwani70@gmail.com', phone: '1111111111' },
      { name: 'Admin 2', email: 'admin@kartiktraders.com', phone: '2222222222' },
      { name: 'Admin 3', email: 'prashantmete0711@gmail.com', phone: '3333333333' }
    ];
    const password = '@Pass.07';
    
    for (const admin of admins) {
      let user = await User.findOne({ email: admin.email });
      
      
      if (!user) {
        // Create new admin
        await User.create({
          name: admin.name,
          email: admin.email,
          password: password,
          phone: admin.phone,
          role: 'admin'
        });
        console.log(`✅ Created admin: ${admin.email}`);
      } else {
        // Force update existing admin password
        user.name = admin.name;
        user.password = password; // Force update password
        user.phone = admin.phone;
        user.role = 'admin';
        user.isActive = true;
        await user.save();
        console.log(`✅ Updated admin password: ${admin.email}`);
      }
    }
    
    console.log('\n🎉 Admin password update complete!');
    console.log('📋 Use these credentials:');
    console.log('   Email: bharatkarwani70@gmail.com');
    console.log('   Password: @Pass.07');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

updateAdminPasswords(); 
