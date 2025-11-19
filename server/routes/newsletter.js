const express = require('express');
const router = express.Router();
const { Newsletter, User } = require('../models');
const authMiddleware = require('../middleware/auth');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ 
      where: { email: email.toLowerCase() }
    });
    if (existing) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    // Create new subscription
    const newsletter = await Newsletter.create({ email: email.toLowerCase() });

    res.status(201).json({ 
      message: 'Successfully subscribed to newsletter',
      data: newsletter 
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
});

// Get all subscribers (Admin only)
router.get('/subscribers', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    console.log('📋 /newsletter/subscribers - req.user:', user);
    
    // Check if user is admin
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const subscribers = await Newsletter.findAll({ 
      where: { createdAt: { [require('sequelize').Op.ne]: null } },
      order: [['createdAt', 'DESC']]
    });

    const stats = {
      totalSubscribers: subscribers.length,
      subscribers: subscribers
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Newsletter subscribers GET error:', error);
    res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
  }
});

// Get subscriber count (Admin only)
router.get('/subscribers/count', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const count = await Newsletter.count();

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscriber count', error: error.message });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const newsletter = await Newsletter.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!newsletter) {
      return res.status(404).json({ message: 'Email not found in subscribers' });
    }

    await newsletter.destroy();

    res.status(200).json({ message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    res.status(500).json({ message: 'Error unsubscribing', error: error.message });
  }
});

// Delete subscriber (Admin only)
router.delete('/subscribers/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { id } = req.params;
    await Newsletter.destroy({ where: { id } });

    res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscriber', error: error.message });
  }
});

module.exports = router;
