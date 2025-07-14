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

async function seedAdmins() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('🔧 Force updating admin passwords...');

  for (const admin of admins) {
    let user = await User.findOne({ email: admin.email });
    const hash = await bcrypt.hash(password, 10);
    
    if (!user) {
      // Create new admin
      await User.create({
        name: admin.name,
        email: admin.email,
        password: hash,
        phone: admin.phone,
        role: 'admin'
      });
      console.log(`✅ Created admin: ${admin.email}`);
    } else {
      // Force update existing admin password
      user.name = admin.name;
      user.password = hash; // Force update password
      user.phone = admin.phone;
      user.role = 'admin';
      user.isActive = true;
      await user.save();
      console.log(`✅ Updated admin password: ${admin.email}`);
    }
  }

  // Remove any non-admin users with these emails
  await User.deleteMany({ role: { $ne: 'admin' }, email: { $in: admins.map(a => a.email) } });

  console.log('🎉 Admin password update complete!');
  console.log('📋 Use these credentials:');
  console.log('   Email: bharatkarwani70@gmail.com');
  console.log('   Password: @Pass.07');
  process.exit();
}

seedAdmins().catch(err => { console.error(err); process.exit(1); }); 