const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  jobId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID
  },
  jobTitle: {
    type: DataTypes.STRING
  },
  companyName: {
    type: DataTypes.STRING
  },
  applicationMethod: {
    type: DataTypes.STRING
  },
  contactEmail: {
    type: DataTypes.STRING
  },
  emailSubject: {
    type: DataTypes.TEXT
  },
  emailBody: {
    type: DataTypes.TEXT('long')
  },
  notes: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'interview', 'rejected', 'accepted'),
    defaultValue: 'pending'
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
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = Application;
