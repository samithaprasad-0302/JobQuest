const express = require('express');
const router = express.Router();
const { Application, Job, User, Company } = require('../models');
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
    const job = await Job.findByPk(jobId, {
      include: [{ model: Company, attributes: ['name'] }]
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Check if user already applied for this job
    const existingApplication = await Application.findOne({
      where: {
        userId: req.user.id,
        jobId: jobId
      }
    });
    
    if (existingApplication) {
      return res.status(409).json({ 
        error: 'You have already applied for this job',
        applicationId: existingApplication.id
      });
    }
    
    // Create new application with only valid fields
    const application = await Application.create({
      userId: req.user.id,
      jobId: jobId,
      applicationMessage: emailBody || notes || null,
      status: 'pending'
    });
    
    // Populate the job details for response
    const populatedApp = await Application.findByPk(application.id, {
      include: [
        { model: Job, attributes: ['title', 'company', 'location', 'salary', 'jobType'] },
        { model: User, attributes: ['firstName', 'lastName', 'email'] }
      ]
    });
    
    res.status(201).json({
      message: 'Application submitted successfully',
      application: populatedApp
    });
    
  } catch (error) {
    console.error('Error creating application:', error);
    
    // Handle duplicate key error
    if (error.name === 'SequelizeUniqueConstraintError') {
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
    const order = [];
    if (sortBy) {
      order.push([sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']);
    }
    
    // Get applications with job details
    const applications = await Application.findAll({
      where: { userId: req.user.id, ...(status && status !== 'all' ? { status } : {}) },
      include: [{
        model: Job,
        attributes: ['title', 'company', 'location', 'salary', 'jobType', 'category', 'isRemote', 'createdAt'],
        include: [{
          model: Company,
          attributes: ['name', 'logo']
        }]
      }],
      order: order.length > 0 ? order : [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Get total count for pagination
    const totalApplications = await Application.count({
      where: { userId: req.user.id, ...(status && status !== 'all' ? { status } : {}) }
    });
    
    // Get user statistics
    const stats = {
      total: totalApplications,
      applied: await Application.count({ where: { userId: req.user.id, status: 'applied' } }),
      under_review: await Application.count({ where: { userId: req.user.id, status: 'under_review' } }),
      interview_scheduled: await Application.count({ where: { userId: req.user.id, status: 'interview_scheduled' } }),
      offered: await Application.count({ where: { userId: req.user.id, status: 'offered' } }),
      rejected: await Application.count({ where: { userId: req.user.id, status: 'rejected' } })
    };
    
    res.json({
      applications: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalApplications / parseInt(limit)),
        totalApplications: totalApplications,
        hasNext: (parseInt(page) - 1) * parseInt(limit) + applications.length < totalApplications,
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
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only access their own applications
      },
      include: [
        { 
          model: Job,
          attributes: ['title', 'company', 'location', 'salary', 'jobType', 'category', 'isRemote', 'description', 'requirements', 'benefits'],
          include: [{
            model: Company,
            attributes: ['name', 'logo', 'website']
          }]
        },
        { model: User, attributes: ['firstName', 'lastName', 'email'] }
      ]
    });
    
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
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only update their own applications
      }
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
    const updatedApp = await Application.findByPk(application.id, {
      include: [
        { 
          model: Job,
          attributes: ['title', 'company', 'location', 'salary', 'jobType'],
          include: [{
            model: Company,
            attributes: ['name', 'logo']
          }]
        }
      ]
    });
    
    res.json({
      message: 'Application updated successfully',
      application: updatedApp
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
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user can only delete their own applications
      }
    });
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    await Application.destroy({ where: { id: req.params.id } });
    
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
    const stats = {
      total: await Application.count({ where: { userId: req.user.id } }),
      applied: await Application.count({ where: { userId: req.user.id, status: 'applied' } }),
      under_review: await Application.count({ where: { userId: req.user.id, status: 'under_review' } }),
      interview_scheduled: await Application.count({ where: { userId: req.user.id, status: 'interview_scheduled' } }),
      offered: await Application.count({ where: { userId: req.user.id, status: 'offered' } }),
      rejected: await Application.count({ where: { userId: req.user.id, status: 'rejected' } })
    };
    
    // Get recent applications (last 5)
    const recentApplications = await Application.findAll({
      where: { userId: req.user.id },
      include: [{ model: Job, attributes: ['title', 'company'] }],
      order: [['appliedAt', 'DESC']],
      limit: 5
    });
    
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