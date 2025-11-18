# MongoDB to MySQL Migration Guide

This guide will help you migrate your JobQuest application from MongoDB to MySQL using Sequelize ORM.

## Prerequisites

1. **MySQL installed locally** or access to a MySQL server (DigitalOcean, AWS RDS, etc.)
2. **Environment variables configured** in `.env` file with MySQL credentials
3. **MongoDB data** that you want to migrate

## Step 1: Install Dependencies

Dependencies have already been installed:
- `sequelize` - ORM for MySQL
- `mysql2` - MySQL driver for Node.js

## Step 2: Configure Your MySQL Database

### Option A: Local MySQL Setup

1. **Install MySQL locally** from https://dev.mysql.com/downloads/mysql/
2. **Create the database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE jobquest;
   EXIT;
   ```

3. **Update `.env` file:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=jobquest
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

### Option B: DigitalOcean Managed MySQL

1. **Create a Managed MySQL cluster** in DigitalOcean
2. **Get connection credentials** from the dashboard
3. **Update `.env` file:**
   ```env
   DB_HOST=your-cluster-host.com
   DB_PORT=3306
   DB_NAME=jobquest
   DB_USER=doadmin
   DB_PASSWORD=your_password
   ```

### Option C: AWS RDS MySQL

1. **Create RDS MySQL instance** in AWS Console
2. **Get endpoint from RDS dashboard**
3. **Update `.env` file:**
   ```env
   DB_HOST=your-instance.rds.amazonaws.com
   DB_PORT=3306
   DB_NAME=jobquest
   DB_USER=admin
   DB_PASSWORD=your_password
   ```

## Step 3: Run the Migration Script

This script will:
- Connect to your MongoDB database
- Create MySQL tables automatically
- Migrate all your data (Users, Companies, Jobs, Contacts, Applications, Newsletters)

```bash
cd server
npm run migrate
```

**Expected Output:**
```
🚀 Starting MongoDB to MySQL migration...

🔄 Initializing MySQL database...
✅ MySQL database ready

📦 Migrating Companies...
   Found X companies
✅ Migrated X companies

👥 Migrating Users...
   Found X users
✅ Migrated X users

💼 Migrating Jobs...
   Found X jobs
✅ Migrated X jobs

📧 Migrating Contacts...
   Found X contacts
✅ Migrated X contacts

📝 Migrating Applications...
   Found X applications
✅ Migrated X applications

📰 Migrating Newsletters...
   Found X newsletter subscriptions
✅ Migrated X newsletter subscriptions

✅ Migration completed successfully!
```

## Step 4: Update Route Files (Gradually)

The migration provides tools to help convert your routes:

### Method 1: Automatic Conversion (Recommended for review)

```bash
npm run convert-routes
```

This will attempt to convert common Mongoose patterns to Sequelize. **Review the changes carefully!**

### Method 2: Manual Conversion Using the Guide

1. Read `MIGRATION_GUIDE.md` in the server directory
2. Convert routes one by one following the examples
3. Test each route as you convert

### Common Conversions

See `MIGRATION_GUIDE.md` for detailed examples, but here's a quick reference:

```javascript
// Before (Mongoose)
const user = await User.findOne({ email });

// After (Sequelize)
const user = await User.findOne({ where: { email } });
```

## Step 5: Update Middleware

Update your authentication middleware in `middleware/auth.js`:

```javascript
// Before
const user = await User.findById(decoded.userId);

// After
const user = await User.findByPk(decoded.userId);
```

## Step 6: Testing

Once you've converted all routes:

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test critical endpoints:**
   - User signup/signin
   - Create job
   - Get all jobs
   - Apply for job
   - Get user profile

3. **Check for errors** in the terminal and fix any issues

## Troubleshooting

### Error: "EPERM: operation not permitted"
- Ensure MySQL server is running
- Check database credentials in `.env`

### Error: "Table 'jobquest.users' doesn't exist"
- Delete the MySQL database and run migration again:
  ```bash
  mysql -u root -p
  DROP DATABASE jobquest;
  CREATE DATABASE jobquest;
  EXIT;
  ```

### Error: "Foreign key constraint fails"
- Some data may not be compatible - check migration logs
- Manually fix referenced IDs in the database

### Slow Migration
- For large datasets (>10,000 records), migration may take time
- You can optimize by modifying `migrate-mongodb-to-mysql.js` to batch insert:
  ```javascript
  const batchSize = 1000;
  for (let i = 0; i < companies.length; i += batchSize) {
    const batch = companies.slice(i, i + batchSize);
    await Company.bulkCreate(batch);
  }
  ```

## Rollback (If Needed)

If you need to rollback to MongoDB:

1. **Keep your MongoDB data intact** (don't delete)
2. **Change back to MongoDB in code:**
   ```javascript
   // In index.js, comment out Sequelize and uncomment Mongoose
   ```
3. **Restore routes** from git: `git checkout -- server/routes/`

## Performance Optimization Tips

1. **Add database indexes:**
   ```javascript
   User.afterSync(async () => {
     await sequelize.query(`CREATE INDEX idx_email ON users(email)`);
     await sequelize.query(`CREATE INDEX idx_status ON jobs(status)`);
   });
   ```

2. **Use connection pooling** (already configured in `config/database.js`)

3. **Cache frequently accessed data** using Redis

## Production Deployment

For deploying to DigitalOcean or AWS:

1. **Use environment variables** for all credentials
2. **Enable SSL/TLS** for database connections
3. **Set up automated backups**
4. **Monitor query performance**
5. **Use read replicas** for large scale

### DigitalOcean Deployment:

```env
DB_HOST=your-db-cluster-host.ondigitalocean.com
DB_PORT=25060
DB_NAME=jobquest
DB_USER=doadmin
DB_PASSWORD=${DATABASE_PASSWORD}
NODE_ENV=production
```

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Environment Variables](https://12factor.net/config)

## Need Help?

If you encounter issues:

1. Check the `MIGRATION_GUIDE.md` for syntax examples
2. Review the conversion script's output carefully
3. Test one route at a time
4. Check MySQL error logs: `tail /var/log/mysql/error.log`

---

**Happy migrating! 🚀**
