const express = require('express');
const router = express.Router();
const GuestApplication = require('../models/GuestApplication');
const Job = require('../models/Job');

// POST /api/guest-applications - Submit a guest application
router.post('/', async (req, res) => {
  try {
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

    // Validate required fields
    if (!email || !firstName || !lastName || !jobId || !jobTitle || !companyName) {
      return res.status(400).json({
        error: 'Missing required fields: email, firstName, lastName, jobId, jobTitle, companyName'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check for duplicate application (same email + job)
    const existingApplication = await GuestApplication.findOne({
      email: email.toLowerCase(),
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(409).json({
        error: 'You have already applied for this job',
        applicationId: existingApplication._id,
        appliedAt: existingApplication.appliedAt
      });
    }

    // Create new guest application
    const guestApplication = new GuestApplication({
      email: email.toLowerCase(),
      firstName,
      lastName,
      phone,
      jobId,
      jobTitle,
      companyName,
      coverLetter,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    const savedApplication = await guestApplication.save();

    // Populate job details for response
    await savedApplication.populate('jobId');

    res.status(201).json({
      message: 'Application submitted successfully',
      application: savedApplication
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

    const applications = await GuestApplication.getByEmail(email);
    
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

    const applications = await GuestApplication.getByJob(jobId);
    
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

    const applications = await GuestApplication.find(query)
      .populate('jobId')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GuestApplication.countDocuments(query);

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
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

    const application = await GuestApplication.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await application.markAsReviewed(reviewerId, status, notes);
    await application.populate('jobId');

    res.json({
      message: 'Application status updated successfully',
      application
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

    const application = await GuestApplication.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

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