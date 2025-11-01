const express = require('express');
const Company = require('../models/Company');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      size,
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (industry) {
      query.industry = new RegExp(industry, 'i');
    }

    if (size) {
      query.size = size;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const companies = await Company.find(query)
      .populate('jobs', 'title status')
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Company.countDocuments(query);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/featured
// @desc    Get featured companies
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const companies = await Company.find({ 
      isActive: true, 
      featured: true 
    })
    .populate('jobs', 'title status')
    .sort({ createdAt: -1 })
    .limit(6);

    res.json(companies);
  } catch (error) {
    console.error('Get featured companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/:id
// @desc    Get single company
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate({
        path: 'jobs',
        match: { status: 'active' },
        options: { sort: { createdAt: -1 } }
      });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/companies/:id/jobs
// @desc    Get company jobs
// @access  Public
router.get('/:id/jobs', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const jobs = await Job.find({ 
      company: req.params.id, 
      status: 'active' 
    })
    .populate('company', 'name logo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Job.countDocuments({ 
      company: req.params.id, 
      status: 'active' 
    });

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/companies/:id/follow
// @desc    Follow/unfollow a company
// @access  Private
router.put('/:id/follow', auth, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const userIndex = company.followers.indexOf(req.user.userId);

    if (userIndex > -1) {
      // Unfollow
      company.followers.splice(userIndex, 1);
    } else {
      // Follow
      company.followers.push(req.user.userId);
    }

    await company.save();

    res.json({ 
      message: userIndex > -1 ? 'Company unfollowed' : 'Company followed',
      following: userIndex === -1
    });
  } catch (error) {
    console.error('Follow company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;