const express = require('express');
const router = express.Router();
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const { User, Company, Job, GuestApplication, Contact, Application } = require('../models');
const { Op } = require('sequelize');

// Admin Dashboard - Get platform statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: { [Op.gte]: new Date(new Date().setDate(1)) }
      }
    });
    
    // Get job statistics
    const totalJobs = await Job.count();
    const activeJobs = await Job.count({ where: { status: 'active' } });
    const pendingJobs = await Job.count({ where: { status: 'pending' } });
    
    // Get company statistics
    const totalCompanies = await Company.count();
    const verifiedCompanies = await Company.count({ where: { verified: true } });
    const pendingCompanies = await Company.count({ where: { verified: false } });
    
    // Get guest application statistics
    const totalGuestApplications = await GuestApplication.count();
    const pendingGuestApplications = await GuestApplication.count({ where: { status: 'pending' } });
    const thisMonthGuestApplications = await GuestApplication.count({
      where: {
        appliedAt: { [Op.gte]: new Date(new Date().setDate(1)) }
      }
    });
    
    // Get recent users (last 10)
    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt', 'isActive'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Get recent jobs (last 10)
    const recentJobs = await Job.findAll({
      include: [{ model: Company, attributes: ['name'] }],
      attributes: ['id', 'title', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get recent guest applications (last 10)
    const recentGuestApplications = await GuestApplication.findAll({
      attributes: ['id', 'guestName', 'guestEmail', 'status', 'appliedAt'],
      order: [['appliedAt', 'DESC']],
      limit: 10
    });

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newThisMonth: newUsersThisMonth,
          inactive: totalUsers - activeUsers
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          pending: pendingJobs
        },
        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          pending: pendingCompanies
        },
        guestApplications: {
          total: totalGuestApplications,
          pending: pendingGuestApplications,
          thisMonth: thisMonthGuestApplications
        }
      },
      recentActivity: {
        users: recentUsers,
        jobs: recentJobs,
        guestApplications: recentGuestApplications
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
});

// Get all users with filters
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'socialAuth'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      users: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Update user
router.put('/users/:id', superAdminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update(req.body, {
      attributes: { exclude: ['password'] }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user
router.delete('/users/:id', superAdminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get all jobs with filters
router.get('/jobs', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, company } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (company) where.companyId = company;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, attributes: ['id', 'name', 'logo', 'industry'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      jobs: rows
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Get job details
router.get('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Company, attributes: ['name'] }]
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Error fetching job' });
  }
});

// Update job status
router.put('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.update(req.body);
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete job
router.delete('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Get all companies with filters
router.get('/companies', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, isVerified, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (isVerified !== undefined) where.isVerified = isVerified === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { industry: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Company.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      companies: rows
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

// Get company details
router.get('/companies/:id', adminAuth, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Error fetching company' });
  }
});

// Verify/Unverify company
router.put('/companies/:id/verify', superAdminAuth, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isVerified = req.body.isVerified;
    await company.save();

    res.json({ message: 'Company status updated', company });
  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({ message: 'Error verifying company' });
  }
});

// Delete company
router.delete('/companies/:id', superAdminAuth, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await company.destroy();
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Error deleting company' });
  }
});

// Get all guest applications with filters
router.get('/guest-applications', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { guestEmail: { [Op.like]: `%${search}%` } },
        { guestName: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await GuestApplication.findAndCountAll({
      where,
      include: [
        { model: Job, attributes: ['id', 'title', 'category'] }
      ],
      order: [['appliedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      applications: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Get guest application details
router.get('/guest-applications/:id', adminAuth, async (req, res) => {
  try {
    const app = await GuestApplication.findByPk(req.params.id);

    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(app);
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Error fetching application' });
  }
});

// Update guest application status
router.put('/guest-applications/:id', adminAuth, async (req, res) => {
  try {
    const app = await GuestApplication.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = req.body.status;
    await app.save();

    res.json({ message: 'Application updated', application: app });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Error updating application' });
  }
});

// Delete guest application
router.delete('/guest-applications/:id', adminAuth, async (req, res) => {
  try {
    const app = await GuestApplication.findByPk(req.params.id);
    if (!app) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await app.destroy();
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Error deleting application' });
  }
});

// Get application statistics
router.get('/statistics/applications', adminAuth, async (req, res) => {
  try {
    const total = await GuestApplication.count();
    const pending = await GuestApplication.count({ where: { status: 'pending' } });
    const reviewed = await GuestApplication.count({ where: { status: 'reviewed' } });
    const accepted = await GuestApplication.count({ where: { status: 'accepted' } });
    const rejected = await GuestApplication.count({ where: { status: 'rejected' } });

    const recentApplications = await GuestApplication.count({
      where: {
        appliedAt: { [Op.gte]: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    res.json({
      total,
      pending,
      reviewed,
      accepted,
      rejected,
      recentApplicationsLastWeek: recentApplications
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all contacts
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    let where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Contact.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      contacts: rows
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Error fetching contacts' });
  }
});

// Get admin permissions for the current user
router.get('/permissions', adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Define permissions based on role
    const permissions = {
      canChangeRoles: user.role === 'superadmin',
      canManageUsers: ['admin', 'superadmin'].includes(user.role),
      canManageJobs: ['admin', 'superadmin'].includes(user.role),
      canManageCompanies: user.role === 'superadmin',
      canManageApplications: ['admin', 'superadmin'].includes(user.role),
      canViewAnalytics: ['admin', 'superadmin'].includes(user.role),
      role: user.role
    };

    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ message: 'Error fetching permissions' });
  }
});

module.exports = router;
