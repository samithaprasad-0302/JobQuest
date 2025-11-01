const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createRegularAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if regular admin user already exists
    const existingAdmin = await User.findOne({ email: 'regularadmin@jobquest.com' });
    if (existingAdmin) {
      console.log('Regular Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create regular admin user
    const regularAdminUser = new User({
      firstName: 'Regular',
      lastName: 'Admin',
      email: 'regularadmin@jobquest.com',
      password: 'regularadmin123456', // This will be hashed by the pre-save middleware
      role: 'admin',
      isVerified: true,
      isActive: true,
      hasProfile: true
    });

    await regularAdminUser.save();
    console.log('Regular Admin user created successfully!');
    console.log('Email: regularadmin@jobquest.com');
    console.log('Password: regularadmin123456');
    console.log('This user CANNOT change roles or modify super admin accounts');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating regular admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createRegularAdmin();