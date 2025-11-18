const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  industry: {
    type: DataTypes.STRING
  },
  website: {
    type: DataTypes.STRING
  },
  logo: {
    type: DataTypes.STRING
  },
  coverImage: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.JSON,
    defaultValue: { headquarters: '' }
  },
  size: {
    type: DataTypes.STRING,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+']
  },
  founded: {
    type: DataTypes.INTEGER
  },
  benefits: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  culture: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.JSON,
    defaultValue: {
      overall: 0,
      workLifeBalance: 0,
      compensation: 0,
      culture: 0,
      management: 0,
      reviewCount: 0
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Company;
