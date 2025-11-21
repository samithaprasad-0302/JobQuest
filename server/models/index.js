const sequelize = require('../config/database');
const User = require('./User');
const Company = require('./Company');
const Job = require('./Job');
const Contact = require('./Contact');
const Application = require('./Application');
const Newsletter = require('./Newsletter');
const GuestApplication = require('./GuestApplication');

// Define associations
User.hasMany(Application, { foreignKey: 'userId' });
Application.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Job, { foreignKey: 'postedBy' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'postedByUser' });

Company.hasMany(Job, { foreignKey: 'companyId' });
Job.belongsTo(Company, { foreignKey: 'companyId' });

Job.hasMany(Application, { foreignKey: 'jobId' });
Application.belongsTo(Job, { foreignKey: 'jobId' });

Company.hasMany(Application, { foreignKey: 'companyId' });
Application.belongsTo(Company, { foreignKey: 'companyId' });

Job.hasMany(GuestApplication, { foreignKey: 'jobId' });
GuestApplication.belongsTo(Job, { foreignKey: 'jobId' });

module.exports = {
  sequelize,
  User,
  Company,
  Job,
  Contact,
  Application,
  Newsletter,
  GuestApplication
};
