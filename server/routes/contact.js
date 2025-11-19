const express = require('express');
const router = express.Router();
const { Contact, User } = require('../models');
const { Op } = require('sequelize');
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
    const contact = await Contact.create({
      firstName,
      lastName,
      email,
      phone: phone || '',
      subject,
      message,
      status: 'new'
    });

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
    console.log('📋 /contact - req.user:', req.user);
    
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const { Op } = require('sequelize');
    const contacts = await Contact.findAll({
      where: query,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit: parseInt(limit)
    });

    const total = await Contact.count({ where: query });

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
    console.error('Contact GET error:', error);
    res.status(500).json({ message: 'Error fetching contacts', error: error.message });
  }
});

// Get contact statistics (Admin only)
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }

    const total = await Contact.count();
    const newMessages = await Contact.count({ where: { status: 'new' } });
    const read = await Contact.count({ where: { status: 'read' } });
    const replied = await Contact.count({ where: { status: 'replied' } });
    const closed = await Contact.count({ where: { status: 'closed' } });

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

    const contact = await Contact.findByPk(req.params.id, {
      include: [{ model: User, as: 'repliedByUser', attributes: ['firstName', 'lastName', 'email'] }]
    });

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Update status to read
    contact.status = 'read';
    await contact.save();

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

    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.reply = reply;
    contact.status = 'replied';
    contact.repliedAt = new Date();
    contact.repliedById = req.user.id;
    await contact.save();

    // Reload with associations
    const updatedContact = await Contact.findByPk(req.params.id, {
      include: [{ model: User, as: 'repliedByUser', attributes: ['firstName', 'lastName', 'email'] }]
    });

    res.status(200).json({
      message: 'Reply sent successfully',
      data: updatedContact
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

    const contact = await Contact.findByPk(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    contact.status = status;
    await contact.save();

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

    await Contact.destroy({ where: { id: req.params.id } });

    res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting contact', error: error.message });
  }
});

module.exports = router;
