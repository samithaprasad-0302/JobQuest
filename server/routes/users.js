const express = require('express');
const multer = require('multer');
const path = require('path');
const { User, Job } = require('../models');
const auth = require('../middleware/auth');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for file uploads (resume only)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination callback for:', file.fieldname);
    if (file.fieldname === 'resume') {
      cb(null, 'uploads/resumes/');
    } else {
      cb(new Error('Invalid file field'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename callback, generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Multer fileFilter for:', file.fieldname, 'mimetype:', file.mimetype);
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/msword' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed for resume'));
      }
    } else {
      cb(new Error('Invalid file field'), null);
    }
  }
});

// Create uploads directories if they don't exist
const createUploadDirs = async () => {
  try {
    await fs.mkdir('uploads/resumes', { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
};

createUploadDirs();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  auth,
  upload.fields([
    { name: 'resume', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Profile update request received:', {
        body: req.body,
        files: req.files,
        userId: req.user.id
      });

      const user = await User.findByPk(req.user.id);
      if (!user) {
        console.log('User not found with id:', req.user.id);
        return res.status(404).json({ msg: 'User not found' });
      }

      // Handle file paths
      if (req.files) {
        console.log('Processing files:', req.files);
        
        if (req.files.resume) {
          // Delete old resume if it exists
          if (user.resume && user.resume.path) {
            try {
              await fs.unlink(user.resume.path);
            } catch (error) {
              console.error('Error deleting old resume:', error);
            }
          }
          // Set resume as an object with all required fields
          user.resume = {
            filename: req.files.resume[0].filename,
            originalName: req.files.resume[0].originalname,
            path: req.files.resume[0].path,
            uploadDate: new Date()
          };
        }
      }

      // Update user fields from form data
      const fields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'location',
        'experience',
        'bio'
      ];

      fields.forEach(field => {
        if (req.body[field]) {
          user[field] = req.body[field];
        }
      });

      // Handle skills array
      if (req.body['skills[]']) {
        user.skills = Array.isArray(req.body['skills[]']) 
          ? req.body['skills[]']
          : [req.body['skills[]']];
        console.log('Updated skills from skills[]:', user.skills);
      } else if (req.body.skills) {
        // Handle skills sent as regular array
        user.skills = Array.isArray(req.body.skills) 
          ? req.body.skills
          : req.body.skills.split(',').map(skill => skill.trim());
        console.log('Updated skills from skills:', user.skills);
      }

      console.log('User object before saving:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        experience: user.experience,
        bio: user.bio,
        skills: user.skills,
        resume: user.resume
      });
      await user.save();
      
      const userResponse = user.toJSON ? user.toJSON() : { ...user.dataValues };
      delete userResponse.password;
      
      // Add hasProfile flag based on profile completeness
      userResponse.hasProfile = !!(user.bio || user.skills?.length > 0 || user.phone || user.location);
      
      res.json(userResponse);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/users/saved-jobs
// @desc    Get user's saved jobs
// @access  Private
router.get('/saved-jobs', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Job,
        as: 'SavedJobs',
        attributes: { exclude: ['password'] },
        through: { attributes: [] },
        include: [{
          model: Company,
          attributes: ['name', 'logo', 'location']
        }]
      }]
    });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const savedJobIds = user.SavedJobs ? user.SavedJobs.map(job => job.id) : [];
    res.json({ savedJobs: savedJobIds });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/save-job/:jobId
// @desc    Save a job for the user
// @access  Private
router.post('/save-job/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Find user and add job to saved jobs
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if job is already saved
    const savedJobs = user.savedJobs || [];
    if (savedJobs.includes(jobId)) {
      return res.status(400).json({ msg: 'Job already saved' });
    }
    
    savedJobs.push(jobId);
    user.savedJobs = savedJobs;
    await user.save();
    
    res.json({ msg: 'Job saved successfully', savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/unsave-job/:jobId
// @desc    Remove a job from saved jobs
// @access  Private
router.delete('/unsave-job/:jobId', auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Find user and remove job from saved jobs
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if job is saved
    const savedJobs = user.savedJobs || [];
    if (!savedJobs.includes(jobId)) {
      return res.status(400).json({ msg: 'Job not in saved jobs' });
    }
    
    user.savedJobs = savedJobs.filter(id => id !== jobId);
    await user.save();
    
    res.json({ msg: 'Job removed from saved jobs', savedJobs: user.savedJobs });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;