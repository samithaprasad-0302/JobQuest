const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models');

async function createAdminUsers() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Create Super Admin
    const superAdminEmail = 'superadmin@jobquest.com';
    const superAdminPassword = 'SuperAdmin@123';

    let superAdmin = await User.findOne({ where: { email: superAdminEmail } });
    
    if (!superAdmin) {
      superAdmin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: superAdminEmail,
        password: superAdminPassword,
        role: 'super_admin',
        isActive: true
      });
      console.log('✅ Super Admin created successfully');
      console.log(`   Email: ${superAdminEmail}`);
      console.log(`   Password: ${superAdminPassword}`);
    } else {
      console.log('⚠️  Super Admin already exists');
    }

    // Create Admin
    const adminEmail = 'admin@jobquest.com';
    const adminPassword = 'Admin@123456';

    let admin = await User.findOne({ where: { email: adminEmail } });
    
    if (!admin) {
      admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin created successfully');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    } else {
      console.log('⚠️  Admin already exists');
    }

    console.log('\n✅ Admin users setup complete!');
    console.log('\n📝 Login Credentials:');
    console.log('─────────────────────────────────────');
    console.log('Super Admin:');
    console.log(`  Email: ${superAdminEmail}`);
    console.log(`  Password: ${superAdminPassword}`);
    console.log('');
    console.log('Admin:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('─────────────────────────────────────');

    await sequelize.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin users:', error.message);
    process.exit(1);
  }
}

createAdminUsers();
