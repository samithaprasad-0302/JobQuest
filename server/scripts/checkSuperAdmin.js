const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find super admin user
    const superAdmin = await User.findOne({ role: 'super_admin' });
    
    if (superAdmin) {
      console.log('Super Admin found:');
      console.log('ID:', superAdmin._id);
      console.log('Email:', superAdmin.email);
      console.log('Role:', superAdmin.role);
      console.log('IsActive:', superAdmin.isActive);
      console.log('IsVerified:', superAdmin.isVerified);
      console.log('HasProfile:', superAdmin.hasProfile);
      console.log('FirstName:', superAdmin.firstName);
      console.log('LastName:', superAdmin.lastName);
      
      // Test password verification
      const isValidPassword = await superAdmin.comparePassword('superadmin123456');
      console.log('Password check result:', isValidPassword);
    } else {
      console.log('No super admin user found!');
    }

  } catch (error) {
    console.error('Error checking super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkSuperAdmin();