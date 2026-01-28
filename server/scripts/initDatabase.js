const { sequelize } = require('../models');
require('dotenv').config();

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Authenticate connection
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized - all tables created');

    console.log('\n📊 Database initialization complete!');
    console.log('All tables have been created successfully.');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
}

initializeDatabase();
