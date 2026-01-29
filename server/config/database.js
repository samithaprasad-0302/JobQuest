const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,

    pool: {
      max: 5,           // max connections
      min: 2,           // keep minimum 2 connections alive
      acquire: 60000,   // 60 seconds to acquire connection
      idle: 30000       // 30 seconds before closing idle connection
    },

    dialectOptions: {
      connectTimeout: 60000,
      enableKeepAlive: true,
      keepAliveInterval: 30000
    },

    retry: {
      max: 3,
      timeout: 5000
    }
  }
);

// Auto reconnect logic
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected');
  } catch (error) {
    console.error('❌ MySQL connection error:', error.message);
    setTimeout(connectDB, 5000); // retry after 5 seconds
  }
};

connectDB();

module.exports = sequelize;
