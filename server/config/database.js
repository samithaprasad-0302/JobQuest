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
      max: 10,          // max connections
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    dialectOptions: {
      connectTimeout: 60000
    }
  }
);

// Auto reconnect logic
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected');
  } catch (error) {
    console.error('❌ MySQL connection error:', error);
    setTimeout(connectDB, 5000); // retry after 5 seconds
  }
};

connectDB();

module.exports = sequelize;
