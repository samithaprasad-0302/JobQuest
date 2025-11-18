const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID
  },
  companyName: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  responsibilities: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING
  },
  isRemote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'freelance', 'internship'),
    defaultValue: 'full-time'
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'mid', 'senior', 'executive'),
    defaultValue: 'mid'
  },
  salary: {
    type: DataTypes.JSON,
    defaultValue: {
      min: 0,
      max: 0,
      currency: 'USD',
      period: 'yearly'
    }
  },
  benefits: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  category: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'closed', 'draft'),
    defaultValue: 'active'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  postedBy: {
    type: DataTypes.UUID
  },
  applicationDeadline: {
    type: DataTypes.DATE
  },
  applicants: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  saves: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Job;
