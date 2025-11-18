# MongoDB to MySQL Migration - Summary

## What Has Been Set Up

### 1. ✅ Sequelize Models Created
All your MongoDB models have been converted to Sequelize models:
- **User.js** - User accounts with password hashing
- **Company.js** - Company profiles
- **Job.js** - Job postings
- **Contact.js** - Contact form submissions
- **Application.js** - Job applications
- **Newsletter.js** - Newsletter subscriptions
- **index.js** - Model initialization and associations

Location: `server/models/`

### 2. ✅ Database Configuration
MySQL configuration file created with connection pooling and error handling:
- Location: `server/config/database.js`
- Supports local MySQL, DigitalOcean, AWS RDS
- Configurable via `.env` variables

### 3. ✅ Migration Script
Automated data migration script that:
- Connects to your MongoDB database
- Creates MySQL tables automatically
- Migrates all collections (companies, users, jobs, contacts, applications, newsletters)
- Handles data type conversions
- Location: `server/scripts/migrate-mongodb-to-mysql.js`

Run with: `npm run migrate`

### 4. ✅ Route Conversion Tools
Two tools to help convert your routes:

#### A. Automatic Pattern Converter
- Location: `server/scripts/convert-routes.js`
- Converts common Mongoose patterns to Sequelize
- Run with: `npm run convert-routes`
- **Important**: Review changes manually!

#### B. Migration Guide (Manual)
- Location: `server/MIGRATION_GUIDE.md`
- Comprehensive guide with side-by-side examples
- Quick reference table for all operations
- Real-world conversion example

### 5. ✅ Setup Documentation
- **MYSQL_SETUP.md** - Step-by-step setup and deployment guide
- Includes local, DigitalOcean, and AWS RDS options
- Troubleshooting section
- Production deployment tips

### 6. ✅ Environment Configuration
Updated files:
- `.env` - Now uses MySQL credentials instead of MongoDB URI
- `.env.example` - Template with MySQL variables

### 7. ✅ NPM Scripts
Added new scripts to `package.json`:
- `npm run migrate` - Run the migration script
- `npm run convert-routes` - Auto-convert routes (review manually)

## Files Created/Modified

### New Files:
```
server/config/database.js                    - MySQL configuration
server/models/User.js                        - Sequelize User model
server/models/Company.js                     - Sequelize Company model
server/models/Job.js                         - Sequelize Job model
server/models/Contact.js                     - Sequelize Contact model
server/models/Application.js                 - Sequelize Application model
server/models/Newsletter.js                  - Sequelize Newsletter model
server/models/index.js                       - Model initialization
server/scripts/migrate-mongodb-to-mysql.js   - Migration script
server/scripts/convert-routes.js             - Route converter helper
server/MIGRATION_GUIDE.md                    - Conversion guide
server/MYSQL_SETUP.md                        - Setup documentation
server/routes/auth-new.js                    - Example converted auth route
```

### Modified Files:
```
server/index.js                              - Switched to Sequelize
server/package.json                          - Added dependencies, npm scripts
server/.env                                  - MySQL configuration
server/.env.example                          - MySQL template
server/models.mongodb/                       - Backup of old models
```

## Quick Start

### 1. Setup MySQL Database
Follow one of these options:
- **Local**: Install MySQL, create database
- **DigitalOcean**: Create managed MySQL cluster
- **AWS RDS**: Create RDS instance

### 2. Update .env File
```env
DB_HOST=localhost          # Your database host
DB_PORT=3306              # Usually 3306
DB_NAME=jobquest          # Database name
DB_USER=root              # Your username
DB_PASSWORD=yourpass      # Your password
JWT_SECRET=somesecret
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Run Migration
```bash
cd server
npm run migrate
```

This will:
- Authenticate to MySQL
- Create all tables
- Copy data from MongoDB
- Show a summary of migrated records

### 4. Convert Routes (Gradually)
You have two options:

**Option A: Automatic (Review Required)**
```bash
npm run convert-routes
```
This converts common patterns. Review the changes!

**Option B: Manual (Recommended)**
- Read `MIGRATION_GUIDE.md`
- Convert routes one by one
- Test as you go

### 5. Test the Application
```bash
npm run dev
```

Test critical flows:
- User signup/signin
- Create/view jobs
- Apply for jobs
- View profile

## Example Conversions

### User Signin Route

**Before (Mongoose):**
```javascript
const user = await User.findOne({ email }).select('+password');
const isMatch = await user.comparePassword(password);
```

**After (Sequelize):**
```javascript
const user = await User.findOne({ where: { email } });
const isMatch = await user.comparePassword(password);
```

### Get All Jobs

**Before (Mongoose):**
```javascript
const jobs = await Job.find(query)
  .populate('company', 'name logo')
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 });
const total = await Job.countDocuments(query);
```

**After (Sequelize):**
```javascript
const { count, rows: jobs } = await Job.findAndCountAll({
  where: query,
  include: [{ model: Company, attributes: ['name', 'logo'] }],
  offset: skip,
  limit: limit,
  order: [['createdAt', 'DESC']]
});
const total = count;
```

## Important Notes

1. **Backup Your Data**: Before running migration, ensure you have backups of both MongoDB and MySQL
2. **Test First**: Test the migration on a development database first
3. **Review Auto-Conversions**: The automatic route converter may miss edge cases
4. **UUIDs**: Sequelize models use UUID for IDs instead of MongoDB ObjectIDs
5. **No Transactions**: Sequelize transactions work differently than MongoDB
6. **Associations**: Update routes that use `.populate()` to use `.include()`

## Estimated Timeline

- **Setup & Configuration**: 10-15 minutes
- **Running Migration**: 5-10 minutes (depends on data size)
- **Route Conversion**: 2-4 hours (manual review required)
- **Testing**: 1-2 hours
- **Deployment**: 30 minutes

## Support Resources

1. **Sequelize Documentation**: https://sequelize.org/
2. **MySQL Reference**: https://dev.mysql.com/doc/
3. **This Repo**: Check MIGRATION_GUIDE.md for detailed examples

## Next Steps

1. ✅ **Setup MySQL** (Follow MYSQL_SETUP.md)
2. ✅ **Run Migration** (`npm run migrate`)
3. ✅ **Convert Routes** (Use MIGRATION_GUIDE.md)
4. ✅ **Test Application** (npm run dev)
5. ✅ **Deploy to Cloud** (DigitalOcean/AWS)

---

**You're ready to migrate! Follow MYSQL_SETUP.md to get started.** 🚀
