const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user has admin role
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Admin access required. Insufficient privileges.' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Server error during authorization' });
  }
};

// Middleware to check if user has super admin role
const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Super admin access required. Only the main administrator can perform this action.' 
      });
    }

    next();
  } catch (error) {
    console.error('Super admin authorization error:', error);
    return res.status(500).json({ message: 'Server error during authorization' });
  }
};

// Combined middleware for admin routes
const adminAuth = [authenticateToken, requireAdmin];

// Combined middleware for super admin routes
const superAdminAuth = [authenticateToken, requireSuperAdmin];

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  adminAuth,
  superAdminAuth
};