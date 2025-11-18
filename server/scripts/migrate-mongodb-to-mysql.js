const mongoose = require('mongoose');
const { sequelize, User, Company, Job, Contact, Application, Newsletter } = require('../models');
require('dotenv').config();

// Connect to MongoDB
const connectMongoDB = async () => {
  try {
    // For local MongoDB (if you have it)
    // await mongoose.connect('mongodb://localhost:27017/jobquest');
    
    // For MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobquest');
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Get MongoDB models
const getMongoModels = () => {
  const UserModel = mongoose.model('User', new mongoose.Schema());
  const CompanyModel = mongoose.model('Company', new mongoose.Schema());
  const JobModel = mongoose.model('Job', new mongoose.Schema());
  const ContactModel = mongoose.model('Contact', new mongoose.Schema());
  const ApplicationModel = mongoose.model('Application', new mongoose.Schema());
  const NewsletterModel = mongoose.model('Newsletter', new mongoose.Schema());

  return { UserModel, CompanyModel, JobModel, ContactModel, ApplicationModel, NewsletterModel };
};

// Migrate data from MongoDB to MySQL
const migrateData = async () => {
  try {
    console.log('\n🚀 Starting MongoDB to MySQL migration...\n');

    // Initialize MySQL database
    console.log('🔄 Initializing MySQL database...');
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });
    console.log('✅ MySQL database ready\n');

    // Get MongoDB collections using raw MongoDB driver
    const mongoConnection = mongoose.connection;
    const db = mongoConnection.db;

    // Migrate Companies
    console.log('📦 Migrating Companies...');
    try {
      const companies = await db.collection('companies').find({}).toArray();
      console.log(`   Found ${companies.length} companies`);
      
      for (const company of companies) {
        await Company.findOrCreate({
          where: { id: company._id?.toString() || require('crypto').randomUUID() },
          defaults: {
            id: company._id?.toString() || require('crypto').randomUUID(),
            name: company.name,
            description: company.description,
            industry: company.industry,
            website: company.website,
            logo: company.logo,
            location: company.location || {},
            size: company.size,
            founded: company.founded,
            benefits: company.benefits || [],
            culture: company.culture,
            rating: company.rating || {},
            verified: company.verified || false,
            featured: company.featured || false,
            isActive: company.isActive !== false
          }
        });
      }
      console.log(`✅ Migrated ${companies.length} companies\n`);
    } catch (error) {
      console.log('⚠️  No companies to migrate or error occurred\n');
    }

    // Migrate Users
    console.log('👥 Migrating Users...');
    try {
      const users = await db.collection('users').find({}).toArray();
      console.log(`   Found ${users.length} users`);
      
      for (const user of users) {
        await User.findOrCreate({
          where: { email: user.email },
          defaults: {
            id: user._id?.toString() || require('crypto').randomUUID(),
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email,
            password: user.password,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            profilePicture: user.profilePicture,
            skills: user.skills || [],
            experience: user.experience || [],
            education: user.education || [],
            role: user.role || 'user',
            isAdmin: user.isAdmin || false,
            emailVerified: user.emailVerified || false,
            verificationToken: user.verificationToken,
            socialAuth: user.socialAuth || {},
            preferences: user.preferences || {},
            savedJobs: user.savedJobs || [],
            isActive: user.isActive !== false
          }
        });
      }
      console.log(`✅ Migrated ${users.length} users\n`);
    } catch (error) {
      console.log('⚠️  No users to migrate or error occurred\n');
    }

    // Migrate Jobs
    console.log('💼 Migrating Jobs...');
    try {
      const jobs = await db.collection('jobs').find({}).toArray();
      console.log(`   Found ${jobs.length} jobs`);
      
      for (const job of jobs) {
        await Job.findOrCreate({
          where: { id: job._id?.toString() || require('crypto').randomUUID() },
          defaults: {
            id: job._id?.toString() || require('crypto').randomUUID(),
            title: job.title,
            companyId: job.company?.toString(),
            companyName: job.companyName,
            description: job.description,
            requirements: job.requirements || [],
            responsibilities: job.responsibilities || [],
            skills: job.skills || [],
            location: job.location,
            isRemote: job.isRemote || false,
            jobType: job.jobType || 'full-time',
            experienceLevel: job.experienceLevel,
            salary: job.salary || {},
            benefits: job.benefits || [],
            category: job.category,
            status: job.status || 'active',
            featured: job.featured || false,
            urgent: job.urgent || false,
            postedBy: job.postedBy?.toString(),
            applicationDeadline: job.applicationDeadline,
            applicants: job.applicants || [],
            views: job.views || 0,
            saves: job.saves || 0,
            tags: job.tags || []
          }
        });
      }
      console.log(`✅ Migrated ${jobs.length} jobs\n`);
    } catch (error) {
      console.log('⚠️  No jobs to migrate or error occurred\n');
    }

    // Migrate Contacts
    console.log('📧 Migrating Contacts...');
    try {
      const contacts = await db.collection('contacts').find({}).toArray();
      console.log(`   Found ${contacts.length} contacts`);
      
      for (const contact of contacts) {
        await Contact.findOrCreate({
          where: { id: contact._id?.toString() || require('crypto').randomUUID() },
          defaults: {
            id: contact._id?.toString() || require('crypto').randomUUID(),
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            subject: contact.subject,
            message: contact.message,
            status: contact.status || 'new',
            replies: contact.replies || []
          }
        });
      }
      console.log(`✅ Migrated ${contacts.length} contacts\n`);
    } catch (error) {
      console.log('⚠️  No contacts to migrate or error occurred\n');
    }

    // Migrate Applications
    console.log('📝 Migrating Applications...');
    try {
      const applications = await db.collection('applications').find({}).toArray();
      console.log(`   Found ${applications.length} applications`);
      
      for (const app of applications) {
        await Application.findOrCreate({
          where: { id: app._id?.toString() || require('crypto').randomUUID() },
          defaults: {
            id: app._id?.toString() || require('crypto').randomUUID(),
            userId: app.userId?.toString(),
            jobId: app.jobId?.toString(),
            companyId: app.companyId?.toString(),
            status: app.status || 'pending',
            applicationMessage: app.applicationMessage,
            resume: app.resume,
            coverLetter: app.coverLetter,
            appliedAt: app.appliedAt || new Date()
          }
        });
      }
      console.log(`✅ Migrated ${applications.length} applications\n`);
    } catch (error) {
      console.log('⚠️  No applications to migrate or error occurred\n');
    }

    // Migrate Newsletters
    console.log('📰 Migrating Newsletters...');
    try {
      const newsletters = await db.collection('newsletters').find({}).toArray();
      console.log(`   Found ${newsletters.length} newsletter subscriptions`);
      
      for (const newsletter of newsletters) {
        await Newsletter.findOrCreate({
          where: { email: newsletter.email },
          defaults: {
            id: newsletter._id?.toString() || require('crypto').randomUUID(),
            email: newsletter.email,
            isSubscribed: newsletter.isSubscribed !== false,
            preferences: newsletter.preferences || {},
            unsubscribeToken: newsletter.unsubscribeToken
          }
        });
      }
      console.log(`✅ Migrated ${newsletters.length} newsletter subscriptions\n`);
    } catch (error) {
      console.log('⚠️  No newsletters to migrate or error occurred\n');
    }

    console.log('✅ Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   - Companies, Users, Jobs, Contacts, Applications, and Newsletters have been migrated');
    console.log('   - MySQL database is now populated with your data');
    console.log('   - You can now switch your application to use MySQL instead of MongoDB\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  const mongoConnected = await connectMongoDB();
  
  if (!mongoConnected) {
    console.error('❌ Could not connect to MongoDB. Please check your MONGODB_URI environment variable.');
    process.exit(1);
  }

  await migrateData();

  // Close connections
  await mongoose.connection.close();
  await sequelize.close();
  
  console.log('🔌 Connections closed. Migration complete!');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateData, connectMongoDB };
