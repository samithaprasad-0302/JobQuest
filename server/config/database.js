const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'jobquest',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 30000, // Keep idle connections for 30 seconds instead of 10
      evict: 15000 // Check for idle connections every 15 seconds
    },
    // MySQL-specific connection settings
    dialectOptions: {
      enableKeepAlive: true
    },
    retry: {
      max: 3,
      timeout: 5000
    }
  }
);

// Keep-alive mechanism to prevent idle connection timeout
setInterval(async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('❌ Keep-alive connection check failed:', error.message);
  }
}, 5 * 60 * 1000); // Check every 5 minutes

module.exports = sequelize;
