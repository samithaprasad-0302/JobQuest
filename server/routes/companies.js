const express = require('express');
const { Op } = require('sequelize');
const { Company, Job } = require('../models');
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
    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (industry) {
      where.industry = { [Op.like]: `%${industry}%` };
    }

    if (size) {
      where.size = size;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const companies = await Company.findAll({
      where,
      include: [{ model: Job, attributes: ['title', 'status'] }],
      order: [['featured', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Company.count({ where });

    res.json({
      companies,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
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
    const companies = await Company.findAll({ 
      where: { isActive: true, featured: true },
      include: [{ model: Job, attributes: ['title', 'status'] }],
      order: [['createdAt', 'DESC']],
      limit: 6
    });

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
    const company = await Company.findByPk(req.params.id, {
      include: [{
        model: Job,
        where: { status: 'active' },
        required: false,
        order: [['createdAt', 'DESC']]
      }]
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

    const jobs = await Job.findAll({ 
      where: { companyId: req.params.id, status: 'active' },
      include: [{ model: Company, attributes: ['name', 'logo'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await Job.count({ 
      where: { companyId: req.params.id, status: 'active' }
    });

    res.json({
      jobs,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
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
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const followers = company.followers || [];
    const userIndex = followers.indexOf(req.user.id);

    if (userIndex > -1) {
      // Unfollow
      followers.splice(userIndex, 1);
    } else {
      // Follow
      followers.push(req.user.id);
    }

    company.followers = followers;
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