const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' }
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Validation middleware
const validateSignup = [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateSignin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { firstName = '', lastName = '', email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST /api/auth/signin
// @desc    Authenticate user
// @access  Public
router.post('/signin', authLimiter, validateSignin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Prevent caching of user data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      resume: user.resume,
      hasProfile: !!(user.bio || user.skills?.length > 0 || user.phone || user.location)
    };

    console.log('📋 /auth/signin - Returning user data:', {
      email: userData.email,
      hasProfile: userData.hasProfile,
      profileData: {
        bio: !!userData.bio,
        skills: userData.skills?.length || 0,
        phone: !!userData.phone,
        location: !!userData.location
      }
    });

    res.json({
        msg: 'User signed in successfully',
        token,
        user: userData
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Server error during signin' });
  }
});

// @route   POST /api/auth/social
// @desc    Social media authentication
// @access  Public
router.post('/social', async (req, res) => {
  try {
    const { provider, socialId, email, firstName, lastName } = req.body;

    if (!['google', 'facebook', 'linkedin', 'twitter'].includes(provider)) {
      return res.status(400).json({ message: 'Invalid social provider' });
    }

    // Check if user exists with social ID
    const socialQuery = {};
    socialQuery[`socialAuth.${provider}.id`] = socialId;
    
    let user = await User.findOne(socialQuery);

    if (!user) {
      // Check if user exists with email
      user = await User.findOne({ email });
      
      if (user) {
        // Link social account to existing user
        user.socialAuth[provider] = { id: socialId, email };
        await user.save();
      } else {
        // Create new user
        const newUser = new User({
          firstName,
          lastName,
          email,
          socialAuth: {
            [provider]: { id: socialId, email }
          }
        });
        user = await newUser.save();
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Prevent caching of user data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      resume: user.resume,
      hasProfile: !!(user.bio || user.skills?.length > 0 || user.phone || user.location)
    };

    console.log('📋 /auth/social - Returning user data:', {
      email: userData.email,
      hasProfile: userData.hasProfile,
      profileData: {
        bio: !!userData.bio,
        skills: userData.skills?.length || 0,
        phone: !!userData.phone,
        location: !!userData.location
      }
    });

    res.json({
      message: 'Social authentication successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Social auth error:', error);
    res.status(500).json({ message: 'Server error during social authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Prevent caching of user data
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).populate('savedJobs appliedJobs.job');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      experience: user.experience,
      resume: user.resume,
      hasProfile: !!(user.bio || user.skills?.length > 0 || user.phone || user.location)
    };

    console.log('📋 /auth/me - Returning user data:', {
      userId: userData.id,
      hasProfile: userData.hasProfile,
      profileData: {
        bio: !!userData.bio,
        skills: userData.skills?.length || 0,
        phone: !!userData.phone,
        location: !!userData.location
      }
    });

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, you would send an email here
    // For now, we'll just return the token (remove this in production)
    res.json({ 
      message: 'Password reset token generated',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;