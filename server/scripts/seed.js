const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobquest');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create sample companies
    const companies = await Company.create([
      {
        name: "TechCorp Inc.",
        description: "A leading technology company specializing in innovative software solutions and cutting-edge development practices.",
        industry: "Technology",
        website: "https://techcorp.com",
        logo: "https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
        location: {
          headquarters: "San Francisco, CA"
        },
        size: "501-1000",
        founded: 2010,
        benefits: ["Health Insurance", "Stock Options", "Flexible Hours", "Remote Work"],
        culture: "Innovation-focused environment with emphasis on creativity and collaboration.",
        rating: {
          overall: 4.8,
          workLifeBalance: 4.7,
          compensation: 4.9,
          culture: 4.8,
          management: 4.6,
          reviewCount: 245
        },
        verified: true,
        featured: true
      },
      {
        name: "StartupX",
        description: "Fast-growing startup revolutionizing the way people work and collaborate in the digital age.",
        industry: "Technology",
        website: "https://startupx.com",
        logo: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
        location: {
          headquarters: "Austin, TX"
        },
        size: "51-200",
        founded: 2018,
        benefits: ["Comprehensive Healthcare", "Retirement Plans", "Learning Budget", "Wellness Programs"],
        culture: "Dynamic startup environment with rapid growth opportunities and innovative projects.",
        rating: {
          overall: 4.5,
          workLifeBalance: 4.3,
          compensation: 4.6,
          culture: 4.7,
          management: 4.4,
          reviewCount: 89
        },
        verified: true,
        featured: true
      },
      {
        name: "DesignHub",
        description: "Creative agency focused on delivering exceptional user experiences and beautiful design solutions.",
        industry: "Design & Creative",
        website: "https://designhub.com",
        logo: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop",
        location: {
          headquarters: "New York, NY"
        },
        size: "11-50",
        founded: 2015,
        benefits: ["Premium Healthcare", "Employee Discounts", "Creative Time", "Fitness Centers"],
        culture: "Creative and collaborative environment where design thinking drives innovation.",
        rating: {
          overall: 4.6,
          workLifeBalance: 4.8,
          compensation: 4.4,
          culture: 4.9,
          management: 4.5,
          reviewCount: 67
        },
        verified: true,
        featured: true
      }
    ]);

    console.log('🏢 Created sample companies');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = await User.create([
      {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: hashedPassword,
        phone: "+1-555-0123",
        location: "San Francisco, CA",
        experience: "senior",
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        bio: "Experienced full-stack developer with a passion for creating scalable web applications.",
        role: "user",
        isVerified: true
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        password: hashedPassword,
        phone: "+1-555-0124",
        location: "New York, NY",
        experience: "mid",
        skills: ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping"],
        bio: "Creative UX designer focused on user-centered design and innovative solutions.",
        role: "user",
        isVerified: true
      },
      {
        firstName: "Admin",
        lastName: "User",
        email: "admin@jobquest.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true
      }
    ]);

    console.log('👥 Created sample users');

    // Create sample jobs
    const jobs = await Job.create([
      {
        title: "Senior Software Engineer",
        company: companies[0]._id,
        description: "Join our innovative team to build cutting-edge software solutions that impact millions of users worldwide. You'll work with the latest technologies and collaborate with talented engineers.",
        requirements: [
          "5+ years of software development experience",
          "Strong proficiency in JavaScript, React, and Node.js",
          "Experience with cloud platforms (AWS, GCP, or Azure)",
          "Knowledge of database design and optimization"
        ],
        responsibilities: [
          "Design and develop scalable web applications",
          "Collaborate with cross-functional teams",
          "Mentor junior developers",
          "Participate in code reviews and technical discussions"
        ],
        skills: ["JavaScript", "React", "Node.js", "AWS", "MongoDB"],
        location: "San Francisco, CA",
        isRemote: false,
        jobType: "full-time",
        experienceLevel: "senior",
        salary: {
          min: 120000,
          max: 180000,
          currency: "USD",
          period: "yearly"
        },
        benefits: ["Health Insurance", "Stock Options", "Flexible Hours", "Remote Work"],
        category: "technology",
        featured: true,
        postedBy: users[2]._id,
        tags: ["React", "Node.js", "Full-stack"]
      },
      {
        title: "Product Manager",
        company: companies[1]._id,
        description: "Lead product strategy for our rapidly growing platform. Work closely with engineering, design, and business teams to deliver exceptional user experiences.",
        requirements: [
          "3+ years of product management experience",
          "Strong analytical and problem-solving skills",
          "Experience with agile development methodologies",
          "Excellent communication and leadership skills"
        ],
        responsibilities: [
          "Define product roadmap and strategy",
          "Work with engineering teams to deliver features",
          "Analyze user feedback and market trends",
          "Coordinate with stakeholders across the organization"
        ],
        skills: ["Product Strategy", "Agile", "Analytics", "Leadership"],
        location: "Remote",
        isRemote: true,
        jobType: "full-time",
        experienceLevel: "mid",
        salary: {
          min: 100000,
          max: 150000,
          currency: "USD",
          period: "yearly"
        },
        benefits: ["Comprehensive Healthcare", "Retirement Plans", "Learning Budget", "Wellness Programs"],
        category: "technology",
        featured: true,
        postedBy: users[2]._id,
        tags: ["Product Management", "Strategy", "Remote"]
      },
      {
        title: "UX Designer",
        company: companies[2]._id,
        description: "Create beautiful and intuitive user experiences for our clients' digital products. Join a creative team that values innovation and user-centered design.",
        requirements: [
          "2+ years of UX/UI design experience",
          "Proficiency in Figma, Sketch, or Adobe XD",
          "Strong portfolio demonstrating design process",
          "Understanding of user research methodologies"
        ],
        responsibilities: [
          "Design user interfaces for web and mobile applications",
          "Conduct user research and usability testing",
          "Create wireframes, prototypes, and design systems",
          "Collaborate with developers and product managers"
        ],
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        location: "New York, NY",
        isRemote: false,
        jobType: "full-time",
        experienceLevel: "mid",
        salary: {
          min: 85000,
          max: 120000,
          currency: "USD",
          period: "yearly"
        },
        benefits: ["Premium Healthcare", "Employee Discounts", "Creative Time", "Fitness Centers"],
        category: "design",
        featured: true,
        postedBy: users[2]._id,
        tags: ["UX Design", "Figma", "User Research"]
      }
    ]);

    console.log('💼 Created sample jobs');

    // Update companies with job references
    for (let i = 0; i < companies.length; i++) {
      companies[i].jobs.push(jobs[i]._id);
      companies[i].admins.push(users[2]._id);
      await companies[i].save();
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Companies: ${companies.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Jobs: ${jobs.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   User: john@example.com / password123');
    console.log('   Admin: admin@jobquest.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();