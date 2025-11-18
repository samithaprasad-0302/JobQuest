const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  lastName: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    lowercase: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  bio: {
    type: DataTypes.TEXT
  },
  profilePicture: {
    type: DataTypes.STRING
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  experience: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  education: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  role: {
    type: DataTypes.ENUM('user', 'employer', 'admin', 'super_admin'),
    defaultValue: 'user'
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING
  },
  socialAuth: {
    type: DataTypes.JSON,
    defaultValue: {
      google: { id: null },
      facebook: { id: null },
      linkedin: { id: null },
      twitter: { id: null }
    }
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  savedJobs: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
