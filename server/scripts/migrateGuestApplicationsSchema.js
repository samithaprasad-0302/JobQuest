const sequelize = require('../config/database');

async function migrateGuestApplicationsSchema() {
  try {
    console.log('📱 Starting database migration: Updating GuestApplications schema to match MongoDB structure...');
    
    const queryInterface = sequelize.getQueryInterface();
    const table = await queryInterface.describeTable('GuestApplications');
    
    console.log('📊 Current table structure:');
    Object.keys(table).forEach(col => {
      console.log(`   - ${col}: ${table[col].type}`);
    });

    // Check what needs to be added
    const needsJobTitle = !table.jobTitle;
    const needsCompanyName = !table.companyName;
    const needsIpAddress = !table.ipAddress;
    const needsUserAgent = !table.userAgent;
    const needsResumeJson = table.resume && table.resume.type !== 'json';

    console.log('\n🔧 Applying migrations...');

    if (needsJobTitle) {
      console.log('  ✓ Adding jobTitle column');
      await queryInterface.addColumn('GuestApplications', 'jobTitle', {
        type: require('sequelize').DataTypes.STRING
      });
    }

    if (needsCompanyName) {
      console.log('  ✓ Adding companyName column');
      await queryInterface.addColumn('GuestApplications', 'companyName', {
        type: require('sequelize').DataTypes.STRING
      });
    }

    if (needsIpAddress) {
      console.log('  ✓ Adding ipAddress column');
      await queryInterface.addColumn('GuestApplications', 'ipAddress', {
        type: require('sequelize').DataTypes.STRING
      });
    }

    if (needsUserAgent) {
      console.log('  ✓ Adding userAgent column');
      await queryInterface.addColumn('GuestApplications', 'userAgent', {
        type: require('sequelize').DataTypes.TEXT
      });
    }

    // Clean up old columns if they exist
    if (table.applicationMessage) {
      console.log('  ✓ Removing applicationMessage column');
      await queryInterface.removeColumn('GuestApplications', 'applicationMessage');
    }

    if (table.companyId) {
      console.log('  ✓ Removing companyId column');
      await queryInterface.removeColumn('GuestApplications', 'companyId');
    }

    console.log('\n✅ Successfully migrated GuestApplications schema');
    console.log('\n📋 Final Schema Fields:');
    console.log('   - id (UUID, primary key)');
    console.log('   - email (STRING, required)');
    console.log('   - firstName (STRING, optional)');
    console.log('   - lastName (STRING, optional)');
    console.log('   - phone (STRING, optional)');
    console.log('   - jobId (UUID, required)');
    console.log('   - jobTitle (STRING, optional)');
    console.log('   - companyName (STRING, optional)');
    console.log('   - coverLetter (TEXT, optional)');
    console.log('   - resume (VARCHAR, optional)');
    console.log('   - status (ENUM: pending, reviewed, rejected)');
    console.log('   - ipAddress (STRING, optional)');
    console.log('   - userAgent (TEXT, optional)');
    console.log('   - appliedAt (DATETIME)');
    console.log('   - createdAt, updatedAt (DATETIME)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating schema:', error.message);
    if (error.parent) {
      console.error('📌 Database Error:', error.parent.message);
    }
    process.exit(1);
  }
}

migrateGuestApplicationsSchema();
