const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Get admin emails from environment variables
const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [
  'bharatkarwani70@gmail.com',
  'admin@kartiktraders.com', 
  'prashantmete0711@gmail.com'
];

const adminNames = process.env.ADMIN_NAMES?.split(',').map(name => name.trim()) || [
  'Admin 1',
  'Admin 2',
  'Admin 3'
];

const adminPhones = process.env.ADMIN_PHONES?.split(',').map(phone => phone.trim()) || [
  '1111111111',
  '2222222222', 
  '3333333333'
];

const password = process.env.ADMIN_PASSWORD || '@Pass.07';

const admins = adminEmails.map((email, index) => ({
  name: adminNames[index] || `Admin ${index + 1}`,
  email: email,
  phone: adminPhones[index] || '0000000000'
}));

const createAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kartik-traders', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    for (const admin of admins) {
      const existingAdmin = await User.findOne({ email: admin.email });
      if (!existingAdmin) {
        await User.create({
          name: admin.name,
          email: admin.email,
          password: password,
          phone: admin.phone,
          role: 'admin',
          isActive: true
        });
        console.log(`Admin created: ${admin.email}`);
      } else {
        existingAdmin.name = admin.name;
        existingAdmin.password = password;
        existingAdmin.phone = admin.phone;
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log(`Admin updated: ${admin.email}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admins:', error);
    process.exit(1);
  }
};

createAdmins(); 