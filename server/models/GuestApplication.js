const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GuestApplication = sequelize.define('GuestApplication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID
  },
  applicationMessage: {
    type: DataTypes.TEXT
  },
  resume: {
    type: DataTypes.STRING
  },
  coverLetter: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'rejected'),
    defaultValue: 'pending'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = GuestApplication;
