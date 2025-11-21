const { sequelize } = require('../models');

const addColumns = async () => {
  try {
    console.log('🔄 Adding email and link columns to Jobs table...');
    
    // First check if columns exist
    const result = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='Jobs' AND COLUMN_NAME IN ('email', 'link')
    `);
    
    const existingColumns = result[0].map(row => row.COLUMN_NAME);
    console.log('📋 Existing columns:', existingColumns);
    
    // Add email column if it doesn't exist
    if (!existingColumns.includes('email')) {
      await sequelize.query(`ALTER TABLE Jobs ADD COLUMN email VARCHAR(255) NULL`);
      console.log('✅ Added email column');
    } else {
      console.log('⏭️ email column already exists');
    }
    
    // Add link column if it doesn't exist
    if (!existingColumns.includes('link')) {
      await sequelize.query(`ALTER TABLE Jobs ADD COLUMN link VARCHAR(255) NULL`);
      console.log('✅ Added link column');
    } else {
      console.log('⏭️ link column already exists');
    }
    
    console.log('✅ All columns ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    process.exit(1);
  }
};

addColumns();
