const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if super admin user already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super Admin user already exists:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Create super admin user
    const superAdminUser = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@jobquest.com',
      password: 'superadmin123456', // This will be hashed by the pre-save middleware
      role: 'super_admin',
      isVerified: true,
      isActive: true,
      hasProfile: true
    });

    await superAdminUser.save();
    console.log('Super Admin user created successfully!');
    console.log('Email: superadmin@jobquest.com');
    console.log('Password: superadmin123456');
    console.log('This user can change roles of other users including regular admins');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating super admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createSuperAdminUser();