const express = require('express');
const router = express.Router();
const { GuestApplication, Job } = require('../models');

// POST /api/guest-applications - Submit a guest application
router.post('/', async (req, res) => {
  try {
    console.log('📋 Incoming guest application request body:', req.body);
    
    const {
      email,
      firstName,
      lastName,
      phone,
      jobId,
      jobTitle,
      companyName,
      coverLetter
    } = req.body;

    console.log('📱 Extracted fields:', {
      email,
      firstName,
      lastName,
      phone,
      jobId
    });

    // Validate required fields
    if (!email || !firstName || !lastName || !jobId) {
      return res.status(400).json({
        error: 'Missing required fields: email, firstName, lastName, jobId'
      });
    }

    // Verify job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check for duplicate application (same email + job)
    const existingApplication = await GuestApplication.findOne({
      where: {
        guestEmail: email.toLowerCase(),
        jobId: jobId
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        error: 'You have already applied for this job',
        applicationId: existingApplication.id,
        appliedAt: existingApplication.appliedAt
      });
    }

    // Create new guest application
    console.log('💾 Creating guest application with data:', {
      guestEmail: email.toLowerCase(),
      guestName: `${firstName} ${lastName}`,
      guestPhone: phone || '',
      jobId
    });

    const guestApplication = await GuestApplication.create({
      guestEmail: email.toLowerCase(),
      guestName: `${firstName} ${lastName}`,
      guestPhone: phone || '',
      jobId,
      applicationMessage: coverLetter || '',
      status: 'pending'
    });

    console.log('✅ Guest application created successfully:', guestApplication.toJSON());

    res.status(201).json({
      message: 'Application submitted successfully',
      application: guestApplication
    });

  } catch (error) {
    console.error('Guest application submission error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ error: 'Server error while submitting application' });
  }
});

// GET /api/guest-applications/by-email/:email - Get applications by email
router.get('/by-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const applications = await GuestApplication.findAll({
      where: { guestEmail: email.toLowerCase() },
      include: [{ model: Job }],
      order: [['appliedAt', 'DESC']]
    });
    
    res.json({
      email: email.toLowerCase(),
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('Get applications by email error:', error);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
});

// GET /api/guest-applications/by-job/:jobId - Get applications for a specific job
router.get('/by-job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    const applications = await GuestApplication.findAll({
      where: { jobId: jobId },
      include: [{ model: Job }],
      order: [['appliedAt', 'DESC']]
    });
    
    res.json({
      jobId,
      count: applications.length,
      applications
    });

  } catch (error) {
    console.error('Get applications by job error:', error);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
});

// GET /api/guest-applications - Get all guest applications (admin route)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && ['pending', 'reviewed', 'rejected', 'accepted'].includes(status)) {
      query.status = status;
    }

    const applications = await GuestApplication.findAll({
      where: query,
      include: [{ model: Job }],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await GuestApplication.count({ where: query });

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
});

// PUT /api/guest-applications/:id/status - Update application status (admin route)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, reviewerId } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    if (!status || !['pending', 'reviewed', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({
        error: 'Valid status is required (pending, reviewed, rejected, accepted)'
      });
    }

    const application = await GuestApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Update application status
    application.status = status;
    application.notes = notes || application.notes;
    application.reviewerId = reviewerId || application.reviewerId;
    application.reviewedAt = new Date();
    await application.save();

    // Reload with associations
    const updated = await GuestApplication.findByPk(id, {
      include: [{ model: Job }]
    });

    res.json({
      message: 'Application status updated successfully',
      application: updated
    });

  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Server error while updating application status' });
  }
});

// DELETE /api/guest-applications/:id - Delete application (admin route)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid application ID format' });
    }

    const application = await GuestApplication.findByPk(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await GuestApplication.destroy({ where: { id } });

    res.json({
      message: 'Application deleted successfully',
      deletedApplication: application
    });

  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Server error while deleting application' });
  }
});

module.exports = router;