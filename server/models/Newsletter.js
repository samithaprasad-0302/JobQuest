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
  isSubscribed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  timestamps: true
});

module.exports = Newsletter;
