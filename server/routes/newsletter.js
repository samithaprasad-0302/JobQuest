const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const authMiddleware = require('../middleware/auth');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing && existing.isActive) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }

    // If previously unsubscribed, reactivate
    if (existing && !existing.isActive) {
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
      return res.status(200).json({ 
        message: 'Successfully reactivated subscription',
        data: existing 
      });
    }

    // Create new subscription
    const newsletter = new Newsletter({ email: email.toLowerCase() });
    await newsletter.save();

    res.status(201).json({ 
      message: 'Successfully subscribed to newsletter',
      data: newsletter 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
});

// Get all subscribers (Admin only)
router.get('/subscribers', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const subscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 });

    const stats = {
      totalSubscribers: subscribers.length,
      subscribers: subscribers
    };

    res.status(200).json(stats);
  } catch (error) {
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

    const count = await Newsletter.countDocuments({ isActive: true });

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

    const newsletter = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!newsletter) {
      return res.status(404).json({ message: 'Email not found in subscribers' });
    }

    newsletter.isActive = false;
    await newsletter.save();

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
    await Newsletter.findByIdAndDelete(id);

    res.status(200).json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscriber', error: error.message });
  }
});

module.exports = router;
