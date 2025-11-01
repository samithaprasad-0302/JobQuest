const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/auth');

// Submit contact form (Public)
router.post('/submit', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create new contact
    const contact = new Contact({
      firstName,
      lastName,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'new'
    });

    await contact.save();

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon!',
      data: contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error submitting contact form', error: error.message });
  }
});

// Get all contacts (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.status(200).json({
      contacts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

// Get contact statistics (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const total = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const read = await Contact.countDocuments({ status: 'read' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    const closed = await Contact.countDocuments({ status: 'closed' });

    res.status(200).json({
      total,
      new: newMessages,
      read,
      replied,
      closed
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact statistics', error: error.message });
  }
});

// Get single contact (Admin only)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    ).populate('repliedBy', 'firstName lastName email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact', error: error.message });
  }
});

// Reply to contact (Admin only)
router.put('/:id/reply', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Please provide a reply message' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        reply,
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: req.user.id
      },
      { new: true }
    ).populate('repliedBy', 'firstName lastName email');

    res.status(200).json({
      message: 'Reply sent successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reply', error: error.message });
  }
});

// Update contact status (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.status(200).json({
      message: 'Status updated successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
});

// Delete contact (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

module.exports = router;
