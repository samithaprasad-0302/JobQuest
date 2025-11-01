const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@jobquest.com',
      password: 'admin123456', // This will be hashed by the pre-save middleware
      role: 'admin',
      isVerified: true,
      isActive: true,
      hasProfile: true
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@jobquest.com');
    console.log('Password: admin123456');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();