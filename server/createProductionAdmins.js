const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const admins = [
  { name: 'Admin 1', email: 'bharatkarwani70@gmail.com', phone: '1111111111' },
  { name: 'Admin 2', email: 'admin@kartiktraders.com', phone: '2222222222' },
  { name: 'Admin 3', email: 'prashantmete0711@gmail.com', phone: '3333333333' }
];
const password = '@Pass.07';

async function createProductionAdmins() {
  try {
    // Connect to production database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }
    
    console.log('Connecting to production database...');
    await mongoose.connect(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to production database successfully!');

    // Remove all admins except the three
    await User.deleteMany({ role: 'admin', email: { $nin: admins.map(a => a.email) } });

    for (const admin of admins) {
      let user = await User.findOne({ email: admin.email });
      
      
      if (!user) {
        await User.create({
          name: admin.name,
          email: admin.email,
          password: password,
          phone: admin.phone,
          role: 'admin',
          isActive: true
        });
        console.log(`✅ Created admin: ${admin.email}`);
      } else {
        user.name = admin.name;
        user.password = password;
        user.phone = admin.phone;
        user.role = 'admin';
        user.isActive = true;
        await user.save();
        console.log(`✅ Updated admin: ${admin.email}`);
      }
    }

    // Remove any non-admin users with these emails
    await User.deleteMany({ role: { $ne: 'admin' }, email: { $in: admins.map(a => a.email) } });

    console.log('🎉 Production admin seeding complete!');
    console.log('You can now login with any of these emails and password: @Pass.07');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating production admins:', error);
    process.exit(1);
  }
}

createProductionAdmins(); 
