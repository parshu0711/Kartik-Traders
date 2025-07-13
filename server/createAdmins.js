const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const admins = [
  { name: 'Admin 1', email: 'Bharatkarwani70@gmail.com', phone: '9876543210' },
  { name: 'Admin 2', email: 'admin@kartiktraders.com', phone: '9876543211' },
  { name: 'Admin 3', email: 'prashantmete0711@gmail.com', phone: '9876543212' }
];
const password = '@Pass.07';

async function seedAdmins() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Remove all admins except the three
  await User.deleteMany({ role: 'admin', email: { $nin: admins.map(a => a.email) } });

  for (const admin of admins) {
    let user = await User.findOne({ email: admin.email });
    const hash = await bcrypt.hash(password, 10);
    if (!user) {
      await User.create({
        name: admin.name,
        email: admin.email,
        password: hash,
        phone: admin.phone,
        role: 'admin'
      });
      console.log(`Created admin: ${admin.email}`);
    } else {
      user.name = admin.name;
      user.password = hash;
      user.phone = admin.phone;
      user.role = 'admin';
      await user.save();
      console.log(`Updated admin: ${admin.email}`);
    }
  }

  // Remove any non-admin users with these emails
  await User.deleteMany({ role: { $ne: 'admin' }, email: { $in: admins.map(a => a.email) } });

  console.log('Admin seeding complete.');
  process.exit();
}

seedAdmins().catch(err => { console.error(err); process.exit(1); }); 