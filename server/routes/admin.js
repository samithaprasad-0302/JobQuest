const express = require('express');
const router = express.Router();
const { adminAuth, superAdminAuth } = require('../middleware/adminAuth');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const GuestApplication = require('../models/GuestApplication');

// Admin Dashboard - Get platform statistics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });
    
    // Get job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingJobs = await Job.countDocuments({ status: 'pending' });
    
    // Get company statistics
    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    const pendingCompanies = await Company.countDocuments({ isVerified: false });
    
    // Get guest application statistics
    const totalGuestApplications = await GuestApplication.countDocuments();
    const pendingGuestApplications = await GuestApplication.countDocuments({ status: 'pending' });
    const thisMonthGuestApplications = await GuestApplication.countDocuments({
      appliedAt: { $gte: new Date(new Date().setDate(1)) }
    });
    
    // Get recent users (last 10)
    const recentUsers = await User.find()
      .select('firstName lastName email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get recent jobs (last 10)
    const recentJobs = await Job.find()
      .populate('company', 'name')
      .select('title company status createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent guest applications (last 10)
    const recentGuestApplications = await GuestApplication.find()
      .populate('jobId', 'title')
      .select('firstName lastName email jobTitle companyName status appliedAt')
      .sort({ appliedAt: -1 })
      .limit(10);

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
          pending: pendingJobs,
          expired: totalJobs - activeJobs - pendingJobs
        },
        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          pending: pendingCompanies,
          unverified: totalCompanies - verifiedCompanies
        },
        guestApplications: {
          total: totalGuestApplications,
          pending: pendingGuestApplications,
          newThisMonth: thisMonthGuestApplications,
          processed: totalGuestApplications - pendingGuestApplications
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
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Check admin permissions - returns current user's role and permissions
router.get('/permissions', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('role firstName lastName email');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      permissions: {
        canChangeRoles: user.role === 'super_admin',
        canManageUsers: user.role === 'admin' || user.role === 'super_admin',
        canManageJobs: user.role === 'admin' || user.role === 'super_admin',
        canManageCompanies: user.role === 'admin' || user.role === 'super_admin'
      }
    });
  } catch (error) {
    console.error('Permissions check error:', error);
    res.status(500).json({ message: 'Failed to check permissions' });
  }
});

// User Management Routes

// Get all users with pagination and filters
router.get('/users', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    if (req.query.isVerified !== undefined) filters.isVerified = req.query.isVerified === 'true';
    if (req.query.search) {
      filters.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .select('-password -socialAuth')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filters);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get specific user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Update user status (activate/deactivate)
router.patch('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    // First find the target user to check their role
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent regular admins from modifying super admin accounts
    if (targetUser.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Access denied. Cannot modify super administrator accounts.' 
      });
    }

    // Prevent changing your own status to avoid lockout
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot change your own account status to prevent lockout' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Update user role - Only super admin can change roles
router.patch('/users/:id/role', superAdminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'employer', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent changing your own role to avoid lockout
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'Cannot change your own role to prevent lockout' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Job Management Routes

// Get all jobs with pagination and filters
router.get('/jobs', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.jobType) filters.jobType = req.query.jobType;
    if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel;
    if (req.query.search) {
      filters.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(filters)
      .populate('company', 'name logo industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments(filters);

    res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalJobs / limit),
        totalJobs,
        limit
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
});

// Update job status (approve/reject)
router.patch('/jobs/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'active', 'rejected', 'expired'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('company', 'name');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      message: `Job ${status} successfully`,
      job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ message: 'Failed to update job status' });
  }
});

// Company Management Routes

// Get all companies with pagination and filters
router.get('/companies', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.isVerified !== undefined) filters.isVerified = req.query.isVerified === 'true';
    if (req.query.industry) filters.industry = req.query.industry;
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { industry: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCompanies = await Company.countDocuments(filters);

    res.json({
      companies,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCompanies / limit),
        totalCompanies,
        limit
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
});

// Update company verification status
router.patch('/companies/:id/verify', adminAuth, async (req, res) => {
  try {
    const { isVerified } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      message: `Company ${isVerified ? 'verified' : 'unverified'} successfully`,
      company
    });
  } catch (error) {
    console.error('Update company verification error:', error);
    res.status(500).json({ message: 'Failed to update company verification' });
  }
});

// Guest Application Management Routes

// Get all guest applications with pagination and filters
router.get('/guest-applications', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.search) {
      filters.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { jobTitle: { $regex: req.query.search, $options: 'i' } },
        { companyName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const applications = await GuestApplication.find(filters)
      .populate('jobId', 'title status')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalApplications = await GuestApplication.countDocuments(filters);

    res.json({
      applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalApplications / limit),
        totalItems: totalApplications,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get guest applications error:', error);
    res.status(500).json({ message: 'Failed to fetch guest applications' });
  }
});

// Get guest application statistics
router.get('/guest-applications/stats', adminAuth, async (req, res) => {
  try {
    const total = await GuestApplication.countDocuments();
    const pending = await GuestApplication.countDocuments({ status: 'pending' });
    const reviewed = await GuestApplication.countDocuments({ status: 'reviewed' });
    const accepted = await GuestApplication.countDocuments({ status: 'accepted' });
    const rejected = await GuestApplication.countDocuments({ status: 'rejected' });

    // Get applications from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentApplications = await GuestApplication.countDocuments({
      appliedAt: { $gte: thirtyDaysAgo }
    });

    // Get unique applicants count
    const uniqueApplicants = await GuestApplication.distinct('email').length;

    res.json({
      total,
      pending,
      reviewed,
      accepted,
      rejected,
      recentApplications,
      uniqueApplicants
    });
  } catch (error) {
    console.error('Get guest application stats error:', error);
    res.status(500).json({ message: 'Failed to fetch guest application statistics' });
  }
});

// Update guest application status
router.put('/guest-applications/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const reviewerId = req.user.id;

    if (!['pending', 'reviewed', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be pending, reviewed, rejected, or accepted' 
      });
    }

    const application = await GuestApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Guest application not found' });
    }

    await application.markAsReviewed(reviewerId, status, notes);

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update guest application status error:', error);
    res.status(500).json({ message: 'Failed to update application status' });
  }
});

// Delete guest application
router.delete('/guest-applications/:id', adminAuth, async (req, res) => {
  try {
    const application = await GuestApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Guest application not found' });
    }

    res.json({
      message: 'Guest application deleted successfully',
      application
    });
  } catch (error) {
    console.error('Delete guest application error:', error);
    res.status(500).json({ message: 'Failed to delete guest application' });
  }
});

// Export guest applications as CSV
router.get('/guest-applications/export/csv', adminAuth, async (req, res) => {
  try {
    // Fetch all guest applications without pagination
    const applications = await GuestApplication.find({})
      .populate('jobId', 'title status')
      .sort({ appliedAt: -1 });

    // Define CSV headers
    const csvHeaders = [
      'Application ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Job Title',
      'Company Name',
      'Job ID',
      'Job Status',
      'Application Status',
      'Applied Date',
      'Cover Letter',
      'IP Address',
      'User Agent',
      'Reviewed Date',
      'Admin Notes'
    ];

    // Generate CSV rows
    const csvRows = applications.map(app => [
      app._id,
      app.firstName || '',
      app.lastName || '',
      app.email || '',
      app.phone || '',
      app.jobTitle || '',
      app.companyName || '',
      app.jobId?._id || '',
      app.jobId?.status || '',
      app.status || '',
      app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : '',
      app.coverLetter ? `"${app.coverLetter.replace(/"/g, '""')}"` : '', // Escape quotes in CSV
      app.ipAddress || '',
      app.userAgent ? `"${app.userAgent.replace(/"/g, '""')}"` : '', // Escape quotes in CSV
      app.reviewedAt ? new Date(app.reviewedAt).toISOString().split('T')[0] : '',
      app.adminNotes ? `"${app.adminNotes.replace(/"/g, '""')}"` : '' // Escape quotes in CSV
    ]);

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    // Set response headers for CSV download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `guest-applications-${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    res.send(csvContent);

  } catch (error) {
    console.error('Export guest applications CSV error:', error);
    res.status(500).json({ message: 'Failed to export guest applications data' });
  }
});

module.exports = router;