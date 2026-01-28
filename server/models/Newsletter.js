const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      jobAlerts: true,
      weeklyDigest: true,
      companyNews: true,
      productUpdates: true
    }
  },
  unsubscribeToken: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  tableName: 'newsletters'
});

module.exports = Newsletter;
