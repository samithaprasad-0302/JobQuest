const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for job image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/jobs';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'job-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/jobs
// @desc    Get all jobs with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      category,
      jobType,
      experienceLevel,
      remote,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }

    if (location && location !== 'remote') {
      query.location = new RegExp(location, 'i');
    }

    if (remote === 'true') {
      query.isRemote = true;
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .populate('company', 'name logo location size rating')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/featured
// @desc    Get featured jobs
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      status: 'active', 
      featured: true 
    })
    .populate('company', 'name logo location size rating')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json(jobs);
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADMIN ROUTES (must be before /:id route) ==========

// @route   GET /api/jobs/admin
// @desc    Get all jobs for admin (including drafts, closed, etc.)
// @access  Private (Admin)
router.get('/admin', ...adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query (admin can see all statuses)
    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const jobs = await Job.find(query)
      .populate('company', 'name logo location size rating')
      .populate('postedBy', 'firstName lastName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalJobs: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Admin get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs/admin
// @desc    Create a new job (admin only)
// @access  Private (Admin)
router.post('/admin', ...adminAuth, upload.single('jobImage'), async (req, res) => {
  try {
    const {
      title,
      companyName,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      benefits,
      category,
      featured,
      urgent,
      applicationDeadline,
      tags,
      link
    } = req.body;

    // Parse JSON strings back to arrays/objects
    const parsedRequirements = requirements ? JSON.parse(requirements) : [];
    const parsedResponsibilities = responsibilities ? JSON.parse(responsibilities) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedBenefits = benefits ? JSON.parse(benefits) : [];
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedSalary = salary ? JSON.parse(salary) : {};

    // Create a company object for the job
    let companyData = {
      name: companyName,
      description: 'No description available',
      industry: 'Technology',
      logo: null, // No default logo - will be handled by frontend
      location: {
        headquarters: location || 'Not specified'
      },
      size: '11-50'
    };

    // Try to find existing company with same name
    let existingCompany = await Company.findOne({ 
      name: { $regex: new RegExp('^' + companyName + '$', 'i') } 
    });

    let companyId;
    if (existingCompany) {
      companyId = existingCompany._id;
    } else {
      // Create new company
      try {
        const newCompany = new Company(companyData);
        await newCompany.save();
        companyId = newCompany._id;
        console.log('✅ Created new company:', companyName);
      } catch (companyError) {
        console.error('❌ Error creating company:', companyError);
        return res.status(400).json({ 
          message: 'Failed to create company', 
          error: companyError.message 
        });
      }
    }

    const jobData = {
      title,
      company: companyId,
      companyName,
      description,
      requirements: parsedRequirements,
      responsibilities: parsedResponsibilities,
      skills: parsedSkills,
      location,
      isRemote: isRemote === 'true',
      jobType,
      experienceLevel,
      salary: parsedSalary,
      benefits: parsedBenefits,
      category,
      featured: featured === 'true',
      urgent: urgent === 'true',
      applicationDeadline: applicationDeadline || null,
      tags: parsedTags,
      link: link || null,
      postedBy: req.user._id,
      status: 'active'
    };

    // Add job image if uploaded
    if (req.file) {
      jobData.jobImage = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadDate: new Date()
      };
    }

    console.log('📝 Creating job with data:', {
      title: jobData.title,
      companyName: jobData.companyName,
      companyId,
      hasImage: !!req.file,
      userId: req.user._id,
      userRole: req.user.role,
      linkValue: link,
      linkInJobData: jobData.link
    });

    const job = new Job(jobData);
    await job.save();
    
    console.log('✅ Job created successfully:', job._id);
    
    // Populate company data for response
    const populatedJob = await Job.findById(job._id)
      .populate('company', 'name logo location size rating')
      .populate('postedBy', 'firstName lastName email');

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/jobs/admin/:id
// @desc    Update a job (admin only)
// @access  Private (Admin)
router.put('/admin/:id', ...adminAuth, upload.single('jobImage'), async (req, res) => {
  try {
    const {
      title,
      companyName,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      benefits,
      category,
      featured,
      urgent,
      applicationDeadline,
      tags,
      link
    } = req.body;

    console.log('🔍 Raw UPDATE request body data:', {
      title,
      companyName,
      link,
      hasFile: !!req.file
    });

    // Parse JSON strings back to arrays/objects
    const parsedRequirements = requirements ? JSON.parse(requirements) : [];
    const parsedResponsibilities = responsibilities ? JSON.parse(responsibilities) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedBenefits = benefits ? JSON.parse(benefits) : [];
    const parsedTags = tags ? JSON.parse(tags) : [];
    const parsedSalary = salary ? JSON.parse(salary) : {};

    // Find the job to update
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Handle company update
    let companyId = existingJob.company;
    if (companyName && companyName !== existingJob.companyName) {
      // Try to find existing company with same name
      let existingCompany = await Company.findOne({ 
        name: { $regex: new RegExp('^' + companyName + '$', 'i') } 
      });

      if (existingCompany) {
        companyId = existingCompany._id;
      } else {
        // Create new company
        const companyData = {
          name: companyName,
          description: 'No description available',
          industry: 'Technology',
          logo: null, // No default logo - will be handled by frontend
          location: {
            headquarters: location || 'Not specified'
          },
          size: '11-50'
        };
        
        const newCompany = new Company(companyData);
        await newCompany.save();
        companyId = newCompany._id;
        console.log('✅ Created new company for update:', companyName);
      }
    }

    const updateData = {
      title,
      company: companyId,
      companyName,
      description,
      requirements: parsedRequirements,
      responsibilities: parsedResponsibilities,
      skills: parsedSkills,
      location,
      isRemote: isRemote === 'true',
      jobType,
      experienceLevel,
      salary: parsedSalary,
      benefits: parsedBenefits,
      category,
      featured: featured === 'true',
      urgent: urgent === 'true',
      applicationDeadline: applicationDeadline || null,
      tags: parsedTags,
      link: link || null,
      updatedAt: new Date()
    };

    // Add job image if uploaded, otherwise keep existing
    if (req.file) {
      updateData.jobImage = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadDate: new Date()
      };
    }

    console.log('📝 Updating job with data:', {
      jobId: req.params.id,
      title: updateData.title,
      companyName: updateData.companyName,
      hasNewImage: !!req.file,
      userId: req.user._id,
      linkValue: link,
      linkInUpdateData: updateData.link
    });

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    )
      .populate('company', 'name logo location size rating')
      .populate('postedBy', 'firstName lastName email');

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log('✅ Job updated successfully:', updatedJob._id);
    res.json(updatedJob);
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/jobs/admin/:id
// @desc    Delete a job (admin only)
// @access  Private (Admin)
router.delete('/admin/:id', ...adminAuth, async (req, res) => {
  try {
    console.log('🗑️ Attempting to delete job:', req.params.id);

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Delete the job image file if it exists
    if (job.jobImage && job.jobImage.filename) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', 'uploads', 'jobs', job.jobImage.filename);
      
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('✅ Deleted job image file:', imagePath);
        }
      } catch (fileError) {
        console.log('⚠️ Could not delete image file:', fileError.message);
      }
    }

    await Job.findByIdAndDelete(req.params.id);
    
    console.log('✅ Job deleted successfully:', req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('postedBy', 'firstName lastName');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Employer/Admin)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      benefits,
      category,
      applicationDeadline,
      tags
    } = req.body;

    // Verify company exists and user has permission
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is admin of the company
    if (!companyDoc.admins.includes(req.user.userId) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to post jobs for this company' });
    }

    const job = new Job({
      title,
      company,
      description,
      requirements,
      responsibilities,
      skills,
      location,
      isRemote,
      jobType,
      experienceLevel,
      salary,
      benefits,
      category,
      applicationDeadline,
      tags,
      postedBy: req.user._id
    });

    await job.save();

    // Add job to company's jobs array
    companyDoc.jobs.push(job._id);
    await companyDoc.save();

    const populatedJob = await Job.findById(job._id).populate('company');

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private
router.put('/:id/apply', auth, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied
    const existingApplication = job.applicants.find(
      app => app.user.toString() === req.user.userId
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Add application
    job.applicants.push({
      user: req.user.userId,
      coverLetter,
      appliedAt: new Date()
    });

    await job.save();

    // Add to user's applied jobs
    const user = await User.findById(req.user.userId);
    user.appliedJobs.push({
      job: job._id,
      appliedAt: new Date()
    });
    await user.save();

    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/jobs/:id/save
// @desc    Save/unsave a job
// @access  Private
router.put('/:id/save', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(req.user.userId);
    const jobIndex = user.savedJobs.indexOf(job._id);

    if (jobIndex > -1) {
      // Unsave job
      user.savedJobs.splice(jobIndex, 1);
      job.saves -= 1;
    } else {
      // Save job
      user.savedJobs.push(job._id);
      job.saves += 1;
    }

    await user.save();
    await job.save();

    res.json({ 
      message: jobIndex > -1 ? 'Job unsaved' : 'Job saved',
      saved: jobIndex === -1
    });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/categories/stats
// @desc    Get job statistics by category
// @access  Public
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;