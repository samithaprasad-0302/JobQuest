const sequelize = require('../config/database');

async function addPhoneColumn() {
  try {
    console.log('📱 Starting database migration: Adding phone column to GuestApplications table...');
    
    // Check if column exists
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable('GuestApplications');
    
    if (table.guestPhone) {
      console.log('✅ Phone column already exists in GuestApplications table');
      process.exit(0);
    }

    // Add the guestPhone column
    await queryInterface.addColumn('GuestApplications', 'guestPhone', {
      type: require('sequelize').DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    });

    console.log('✅ Successfully added guestPhone column to GuestApplications table');
    console.log('📋 Column Details:');
    console.log('   - Column name: guestPhone');
    console.log('   - Type: STRING');
    console.log('   - Nullable: Yes');
    console.log('   - Default: Empty string');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding phone column:', error.message);
    process.exit(1);
  }
}

addPhoneColumn();
