const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Create a new application
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, applicationMethod, contactEmail, emailSubject, emailBody, notes } = req.body;
    
    // Validate required fields
    if (!jobId || !applicationMethod) {
      return res.status(400).json({ 
        error: 'Job ID and application method are required' 
      });
    }
    
    // Get job details
    const job = await Job.findById(jobId).populate('company', 'name');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user already applied for this job
    const existingApplication = await Application.findOne({
      userId: req.user.id,
      jobId: jobId
    });
    
    if (existingApplication) {
      return res.status(409).json({ 
        error: 'You have already applied for this job',
        applicationId: existingApplication._id
      });
    }
    
    // Create new application
    const application = new Application({
      userId: req.user.id,
      jobId: jobId,
      jobTitle: job.title,
      companyName: job.company?.name || job.companyName,
      applicationMethod: applicationMethod,
      contactEmail: contactEmail,
      emailSubject: emailSubject,
      emailBody: emailBody,
      notes: notes
    });
    
    await application.save();
    
    // Populate the job details for response
    await application.populate([
      { path: 'jobId', select: 'title company location salary jobType' },
      { path: 'userId', select: 'firstName lastName email' }
    ]);
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: application
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'You have already applied for this job' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit application',
      details: error.message 
    });
  }
});

// Get all applications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'appliedAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { userId: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Get applications with job details
    const applications = await Application.find(query)
      .populate([
        { 
          path: 'jobId', 
          select: 'title company location salary jobType category isRemote createdAt',
          populate: {
            path: 'company',
            select: 'name logo'
          }
        }
      ])
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalApplications = await Application.countDocuments(query);
    
    // Get user statistics
    const stats = await Application.getUserStats(req.user.id);
    
    res.json({
      applications: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalApplications: totalApplications,
        hasNext: skip + applications.length < totalApplications,
        hasPrev: parseInt(page) > 1
      },
      statistics: stats
    });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      details: error.message 
    });
  }
});

// Get a specific application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id // Ensure user can only access their own applications
    }).populate([
      { 
        path: 'jobId', 
        select: 'title company location salary jobType category isRemote description requirements benefits',
        populate: {
          path: 'company',
          select: 'name logo website'
        }
      },
      { path: 'userId', select: 'firstName lastName email' }
    ]);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(application);
    
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ 
      error: 'Failed to fetch application',
      details: error.message 
    });
  }
});

// Update application status and notes
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['applied', 'under_review', 'interview_scheduled', 'offered', 'rejected', 'withdrawn'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id // Ensure user can only update their own applications
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Update fields
    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.lastUpdated = new Date();
    
    await application.save();
    
    // Populate for response
    await application.populate([
      { 
        path: 'jobId', 
        select: 'title company location salary jobType',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      }
    ]);
    
    res.json({
      message: 'Application updated successfully',
      application: application
    });
    
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ 
      error: 'Failed to update application',
      details: error.message 
    });
  }
});

// Delete an application
router.delete('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      userId: req.user.id // Ensure user can only delete their own applications
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    await Application.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Application deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ 
      error: 'Failed to delete application',
      details: error.message 
    });
  }
});

// Get application statistics for the user
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Application.getUserStats(req.user.id);
    
    // Get recent applications (last 5)
    const recentApplications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company')
      .sort({ appliedAt: -1 })
      .limit(5);
    
    res.json({
      statistics: stats,
      recentApplications: recentApplications
    });
    
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch application statistics',
      details: error.message 
    });
  }
});

module.exports = router;