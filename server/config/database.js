const { Sequelize } = require('sequelize');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false
  }
);

sequelize
  .authenticate()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch((err) => console.error('❌ DB connection failed:', err));

module.exports = sequelize;
