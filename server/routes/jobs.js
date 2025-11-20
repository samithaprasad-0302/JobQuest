const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op, fn, col, literal } = require('sequelize');
const { Job, Company, User, sequelize } = require('../models');
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
    const where = { status: 'active' };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (location && location !== 'remote') {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (remote === 'true') {
      where.isRemote = true;
    }

    if (category) {
      where.category = { [Op.like]: `%${category}%` };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Sort options
    const order = [[sortBy || 'createdAt', sortOrder === 'desc' ? 'DESC' : 'ASC']];

    // Execute query with pagination
    const jobs = await Job.findAll({
      where,
      include: [{ 
        model: Company, 
        attributes: ['name', 'logo', 'location', 'size', 'rating'] 
      }],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    // Get total count for pagination
    const total = await Job.count({ where });

    res.json({
      jobs,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
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
    const jobs = await Job.findAll({ 
      where: { status: 'active', featured: true },
      include: [{ 
        model: Company, 
        attributes: ['name', 'logo', 'location', 'size', 'rating'] 
      }],
      order: [['createdAt', 'DESC']],
      limit: 6
    });

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
router.get('/admin', adminAuth[0], adminAuth[1], async (req, res) => {
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
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (featured !== undefined) {
      where.featured = featured === 'true';
    }

    // Sort options
    const order = [[sortBy || 'createdAt', sortOrder === 'desc' ? 'DESC' : 'ASC']];

    // Execute query with pagination
    const jobs = await Job.findAll({
      where,
      include: [
        { model: Company, attributes: ['name', 'logo', 'location', 'size', 'rating'] },
        { model: User, as: 'postedByUser', attributes: ['firstName', 'lastName', 'email'] }
      ],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Job.count({ where });

    res.json({
      jobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalJobs: total,
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    });
  } catch (error) {
    console.error('Admin get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/jobs/admin
// @desc    Create a new job (admin only)
// @access  Private (Admin)
router.post('/admin', adminAuth[0], adminAuth[1], upload.single('jobImage'), async (req, res) => {
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

    // Parse JSON strings back to arrays/objects with error handling
    const parseJSON = (str, defaultValue = []) => {
      try {
        return str ? JSON.parse(str) : defaultValue;
      } catch (e) {
        console.warn('Failed to parse JSON:', str, e.message);
        return defaultValue;
      }
    };

    const parsedRequirements = parseJSON(requirements, []);
    const parsedResponsibilities = parseJSON(responsibilities, []);
    const parsedSkills = parseJSON(skills, []);
    const parsedBenefits = parseJSON(benefits, []);
    const parsedTags = parseJSON(tags, []);
    const parsedSalary = parseJSON(salary, {});

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
      where: {
        name: {
          [Op.like]: companyName
        }
      }
    });

    let companyId;
    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // Create new company
      try {
        const newCompany = await Company.create(companyData);
        companyId = newCompany.id;
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
      companyId,
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
      postedBy: req.user.id,
      status: 'active'
    };

    // Add job image if uploaded
    if (req.file) {
      jobData.image = {
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
      userId: req.user.id,
      userRole: req.user.role,
      linkValue: link,
      linkInJobData: jobData.link
    });

    const job = await Job.create(jobData);
    
    console.log('✅ Job created successfully:', job.id);
    
    // Populate company data for response
    const populatedJob = await Job.findByPk(job.id, {
      include: [
        { model: Company, attributes: ['name', 'logo', 'location', 'size', 'rating'] },
        { model: User, as: 'postedByUser', attributes: ['firstName', 'lastName', 'email'] }
      ]
    });

    res.status(201).json(populatedJob);
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/jobs/admin/:id
// @desc    Update a job (admin only)
// @access  Private (Admin)
router.put('/admin/:id', adminAuth[0], adminAuth[1], upload.single('jobImage'), async (req, res) => {
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

    // Parse JSON strings back to arrays/objects with error handling
    const parseJSON = (str, defaultValue = []) => {
      try {
        return str ? JSON.parse(str) : defaultValue;
      } catch (e) {
        console.warn('Failed to parse JSON:', str, e.message);
        return defaultValue;
      }
    };

    const parsedRequirements = parseJSON(requirements, []);
    const parsedResponsibilities = parseJSON(responsibilities, []);
    const parsedSkills = parseJSON(skills, []);
    const parsedBenefits = parseJSON(benefits, []);
    const parsedTags = parseJSON(tags, []);
    const parsedSalary = parseJSON(salary, {});

    // Find the job to update
    const existingJob = await Job.findByPk(req.params.id);
    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Handle company update
    let companyId = existingJob.companyId;
    if (companyName && companyName !== existingJob.companyName) {
      // Try to find existing company with same name
      let existingCompany = await Company.findOne({ 
        where: {
          name: {
            [Op.like]: companyName
          }
        }
      });

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // Create new company
        const companyData = {
          name: companyName,
          description: 'No description available',
          industry: 'Technology',
          logo: null,
          location: location || 'Not specified',
          size: '11-50'
        };
        
        const newCompany = await Company.create(companyData);
        companyId = newCompany.id;
        console.log('✅ Created new company for update:', companyName);
      }
    }

    const updateData = {
      title,
      companyId,
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
      updateData.image = {
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
      userId: req.user.id,
      linkValue: link,
      linkInUpdateData: updateData.link
    });

    const updatedJob = await Job.update(
      updateData, 
      { where: { id: req.params.id }, returning: true }
    );

    if (!updatedJob[0]) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const jobResult = await Job.findByPk(req.params.id, {
      include: [
        { model: Company, attributes: ['name', 'logo', 'location', 'size', 'rating'] },
        { model: User, as: 'postedByUser', attributes: ['firstName', 'lastName', 'email'] }
      ]
    });

    console.log('✅ Job updated successfully:', jobResult.id);
    res.json(jobResult);
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/jobs/admin/:id
// @desc    Delete a job (admin only)
// @access  Private (Admin)
router.delete('/admin/:id', adminAuth[0], adminAuth[1], async (req, res) => {
  try {
    console.log('🗑️ Attempting to delete job:', req.params.id);

    const job = await Job.findByPk(req.params.id);
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

    await Job.destroy({ where: { id: req.params.id } });
    
    console.log('✅ Job deleted successfully:', req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/jobs/categories/stats
// @desc    Get job statistics by category
// @access  Public
router.get('/categories/stats', async (req, res) => {
  try {
    const stats = await Job.findAll({
      where: { status: 'active' },
      attributes: [
        [fn('COUNT', col('id')), 'count'],
        'category'
      ],
      group: ['category'],
      order: [[literal('count'), 'DESC']],
      raw: true,
      subQuery: false
    });

    const formattedStats = stats.map(stat => ({
      category: stat.category,
      count: parseInt(stat.count)
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: Company },
        { model: User, as: 'postedByUser', attributes: ['firstName', 'lastName'] }
      ]
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Increment view count
    job.views = (job.views || 0) + 1;
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
    const companyDoc = await Company.findByPk(company);
    if (!companyDoc) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if user is admin of the company (assuming admins field exists)
    // For now, allowing any authenticated user to post
    const job = await Job.create({
      title,
      companyId: company,
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
      postedBy: req.user.id
    });

    const populatedJob = await Job.findByPk(job.id, {
      include: [{ model: Company }]
    });

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
    
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user already applied (assuming applicants is stored as JSON)
    const applicants = job.applicants || [];
    const existingApplication = applicants.find(
      app => app.userId === req.user.id
    );

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Add application
    applicants.push({
      userId: req.user.id,
      coverLetter,
      appliedAt: new Date()
    });
    job.applicants = applicants;

    await job.save();

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
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findByPk(req.user.id);
    const savedJobs = user.savedJobs || [];
    const jobIndex = savedJobs.findIndex(id => id === req.params.id);

    if (jobIndex > -1) {
      // Unsave job
      savedJobs.splice(jobIndex, 1);
      job.saves = Math.max((job.saves || 1) - 1, 0);
    } else {
      // Save job
      savedJobs.push(req.params.id);
      job.saves = (job.saves || 0) + 1;
    }

    user.savedJobs = savedJobs;
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

module.exports = router;